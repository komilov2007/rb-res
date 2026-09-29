"use client";

import { ShoppingBag } from "lucide-react";
import { useTranslations } from "next-intl";

import Button from "@/components/ui/button";
import { useCartStore } from "@/stores/cart";
import { getCartTotal } from "@/utils/cart";
import { formatPrice } from "@/utils/format-price";

// Desktop-only cart shortcut in the bottom-right corner, under the Hand
// action button (MobileAction moves up to make room while the cart has
// items). Mobile opens the cart from the bottom nav instead.
const FloatingCart = () => {
  const t = useTranslations();
  const carts = useCartStore((state) => state.carts);
  const cartCount = useCartStore((state) => state.cartCount);
  const openCartModal = useCartStore((state) => state.openCartModal);

  if (cartCount === 0) return null;

  const total = getCartTotal(carts);

  return (
    <div className="fixed bottom-12 right-8 z-40 hidden lg:block">
      <Button
        type="button"
        variant="floating-cart"
        size="floatingCartDesktop"
        onClick={() => openCartModal("desktop")}
      >
        <CartIcon count={cartCount} />
        <span className="min-w-0 text-left">
          <span className="block text-sm font-medium leading-none">
            {t("cart")}
          </span>
          <span className="mt-1 block text-xs font-medium leading-none opacity-80">
            {formatPrice(total)} {t("sum")}
          </span>
        </span>
      </Button>
    </div>
  );
};

const CartIcon = ({ count }: { count: number }) => {
  return (
    <span className="relative grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-white/18">
      <ShoppingBag size={21} />
      <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-white px-1 text-[10px] font-medium leading-none text-primary">
        {count}
      </span>
    </span>
  );
};

export default FloatingCart;
