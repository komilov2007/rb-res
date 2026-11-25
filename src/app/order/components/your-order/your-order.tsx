"use client";

import { useTranslations } from "next-intl";
import { useFormContext, useWatch } from "react-hook-form";

import { useCartStore } from "@/stores/cart";
import { getCartOriginalTotal } from "@/utils/cart";
import { formatPrice } from "@/utils/format-price";
import { useGeneral } from "@/hooks/useGeneral";
import { MinOrderNotice, useDeliveryInfoLabel } from "@/components/delivery-info";
import { getServiceMinPrice, isCustomDelivery } from "@/utils/delivery-rules";
import type { OrderFormValues } from "@/types/order";

const LABEL_CLASS_NAME = "text-sm font-normal text-gray220";

type YourOrderProps = {
  cartCount: number;
  cartTotal: number;
  deliveryPrice: number;
  promoTotal: number | null;
  cashbackBall: number;
  oldPrice: number | null;
  displayTotal: number;
};

const YourOrder = ({
  cartCount,
  cartTotal,
  deliveryPrice,
  promoTotal,
  cashbackBall,
  oldPrice,
  displayTotal,
}: YourOrderProps) => {
  const t = useTranslations();
  const carts = useCartStore((state) => state.carts);
  const originalTotal = getCartOriginalTotal(carts);
  const productDiscount = Math.max(0, originalTotal - cartTotal);
  const { control } = useFormContext<OrderFormValues>();
  const deliveryType = useWatch({ control, name: "delivery_type" });
  const { data: general } = useGeneral();
  const deliveryLabel = useDeliveryInfoLabel();
  const minPrice = getServiceMinPrice(general?.data, deliveryType);
  const isBelowMin = minPrice !== null && cartTotal < minPrice;
  // CUSTOM: narx raqam emas — do'kon yozgan matn ko'rsatiladi (rb-webapp delivery.tsx)
  const showCustomDelivery =
    deliveryType === "DELIVERY" && isCustomDelivery(general?.data);

  return (
    <section className="rounded-2xl bg-white p-4">
      <h2 className="text-base font-medium text-black">
        {t("order_page_summary_title")}
      </h2>

      <div className="my-3 border-t border-dashed border-gray180" />

      <div className="flex items-center justify-between">
        <span className={LABEL_CLASS_NAME}>
          {t("cart_product_count", { count: cartCount })}
        </span>
        <span className="text-sm font-medium text-black">
          {formatPrice(cartTotal + productDiscount)} {t("sum")}
        </span>
      </div>

      {productDiscount > 0 && (
        <div className="mt-2 flex items-center justify-between text-sm font-medium text-green-500">
          <span>{t("order_page_summary_product_discount")}</span>
          <span>
            -{formatPrice(productDiscount)} {t("sum")}
          </span>
        </div>
      )}

      {promoTotal !== null && (
        <div className="mt-2 flex items-center justify-between text-sm font-medium text-green-500">
          <span>{t("order_page_summary_promo_discount")}</span>
          <span>
            -{formatPrice(cartTotal - promoTotal)} {t("sum")}
          </span>
        </div>
      )}

      {showCustomDelivery && deliveryLabel && (
        <div className="mt-2 flex items-start justify-between gap-3">
          <span className={`shrink-0 ${LABEL_CLASS_NAME}`}>
            {t("order_page_summary_delivery_price")}
          </span>
          <span className="text-right text-sm font-medium text-black">
            {deliveryLabel}
          </span>
        </div>
      )}

      {!showCustomDelivery && deliveryPrice > 0 && (
        <div className="mt-2 flex items-center justify-between">
          <span className={LABEL_CLASS_NAME}>
            {t("order_page_summary_delivery_price")}
          </span>
          <span className="text-sm font-medium text-black">
            {formatPrice(deliveryPrice)} {t("sum")}
          </span>
        </div>
      )}

      {cashbackBall > 0 && (
        <div className="mt-2 flex items-center justify-between text-sm font-medium text-green-500">
          <span>{t("order_page_summary_bonus")}</span>
          <span>
            -{formatPrice(cashbackBall)} {t("sum")}
          </span>
        </div>
      )}

      <div className="my-3 border-t border-dashed border-gray180" />

      <div className="flex items-center justify-between">
        <span className={LABEL_CLASS_NAME}>
          {t("order_page_summary_total")}
        </span>
        <span className="flex flex-col items-end">
          {oldPrice !== null && (
            <span className="text-xs font-medium text-gray220 line-through">
              {formatPrice(oldPrice)} {t("sum")}
            </span>
          )}
          <span className="text-base font-medium text-black lg:text-lg">
            {formatPrice(displayTotal)} {t("sum")}
          </span>
        </span>
      </div>

      {isBelowMin && minPrice !== null && (
        <MinOrderNotice minPrice={minPrice} total={cartTotal} className="mt-3" />
      )}
    </section>
  );
};

export default YourOrder;
