"use client";

import { ShoppingBag } from "lucide-react";
import { useTranslations } from "next-intl";

import Button from "@/components/ui/button";
import { useCartStore } from "@/store/cart";
import { formatPrice } from "@/utils/format-price";

const FloatingCart = () => {
  const t = useTranslations();
  const carts = useCartStore((state) => state.carts);
  const cartCount = useCartStore((state) => state.cartCount);
  const openCartModal = useCartStore((state) => state.openCartModal);

  const total = carts.reduce((sum, item) => {
    const price = item.product.discount_price ?? item.product.price;

    return sum + price * item.quantity;
  }, 0);

  return (
    <>
      {cartCount === 0 ? null : (
        <div className="fixed bottom-12 right-8 z-40 hidden lg:block">
          <Button
            type="button"
            variant="floating-cart"
            size="floatingCartDesktop"
            onClick={() => openCartModal("desktop")}
          >
            <CartIcon count={cartCount} />
            <span className="min-w-0 text-left">
              <span className="block text-sm font-bold leading-none">
                {t("cart")}
              </span>
              <span className="mt-1 block text-xs font-semibold leading-none opacity-80">
                {formatPrice(total)} {t("sum")}
              </span>
            </span>
          </Button>
        </div>
      )}
    </>
  );
};

const CartIcon = ({ count }: { count: number }) => {
  return (
    <span className="relative grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-white/18">
      <ShoppingBag size={21} />
      <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-white px-1 text-[10px] font-extrabold leading-none text-primary">
        {count}
      </span>
    </span>
  );
};

export default FloatingCart;
