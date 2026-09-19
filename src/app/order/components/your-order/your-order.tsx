"use client";

import { useTranslations } from "next-intl";

import { useCartStore } from "@/stores/cart";
import { formatPrice } from "@/utils/format-price";

type YourOrderProps = {
  cartCount: number;
  cartTotal: number;
  deliveryPrice: number;
  promoTotal: number | null;
  unavailableTotal: number;
  cashbackBall: number;
  oldPrice: number | null;
  displayTotal: number;
};

const YourOrder = ({
  cartCount,
  cartTotal,
  deliveryPrice,
  promoTotal,
  unavailableTotal,
  cashbackBall,
  oldPrice,
  displayTotal,
}: YourOrderProps) => {
  const t = useTranslations();
  const carts = useCartStore((state) => state.carts);
  // cartTotal already uses each product's discount_price; showing the
  // undiscounted sum plus a separate discount line makes the saving visible.
  const originalTotal = carts.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );
  const productDiscount = Math.max(0, originalTotal - cartTotal);

  return (
    <section className="rounded-2xl bg-white p-4">
      <h2 className="text-sm font-bold text-black">
        {t("order_page.summary.title")}
      </h2>

      <div className="mt-3 flex items-center justify-between text-sm font-medium text-gray220">
        <span>{t("cart_product_count", { count: cartCount })}</span>
        <span>
          {formatPrice(cartTotal + productDiscount)} {t("sum")}
        </span>
      </div>

      {productDiscount > 0 && (
        <div className="mt-2 flex items-center justify-between text-sm font-medium text-green-500">
          <span>{t("order_page.summary.product_discount")}</span>
          <span>
            -{formatPrice(productDiscount)} {t("sum")}
          </span>
        </div>
      )}

      {promoTotal !== null && (
        <div className="mt-2 flex items-center justify-between text-sm font-medium text-green-500">
          <span>{t("order_page.summary.promo_discount")}</span>
          <span>
            -{formatPrice(cartTotal - promoTotal)} {t("sum")}
          </span>
        </div>
      )}

      {deliveryPrice > 0 && (
        <div className="mt-2 flex items-center justify-between text-sm font-medium text-gray220">
          <span>{t("order_page.summary.delivery_price")}</span>
          <span>
            {formatPrice(deliveryPrice)} {t("sum")}
          </span>
        </div>
      )}

      {unavailableTotal > 0 && (
        <div className="mt-2 flex items-center justify-between text-sm font-medium text-red">
          <span>{t("order_page.summary.unavailable")}</span>
          <span>
            -{formatPrice(unavailableTotal)} {t("sum")}
          </span>
        </div>
      )}

      {cashbackBall > 0 && (
        <div className="mt-2 flex items-center justify-between text-sm font-medium text-green-500">
          <span>{t("order_page.summary.bonus")}</span>
          <span>
            -{formatPrice(cashbackBall)} {t("sum")}
          </span>
        </div>
      )}

      <div className="my-3 border-t border-dashed border-gray180" />

      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-black">
          {t("order_page.summary.total")}
        </span>
        <span className="flex flex-col items-end">
          {oldPrice !== null && (
            <span className="text-xs font-medium text-gray220 line-through">
              {formatPrice(oldPrice)} {t("sum")}
            </span>
          )}
          <span className="text-sm font-extrabold text-black">
            {formatPrice(displayTotal)} {t("sum")}
          </span>
        </span>
      </div>
    </section>
  );
};

export default YourOrder;
