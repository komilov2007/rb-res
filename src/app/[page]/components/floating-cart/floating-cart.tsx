"use client";

import { ShoppingBag } from "lucide-react";
import { useTranslations } from "next-intl";

import Button from "@/components/ui/button";
import { useCartStore } from "@/stores/cart";
import { formatPrice } from "@/utils/format-price";
import { IMAGE_PLACEHOLDER_SRC, handleImageFallback } from "@/utils/image";

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
        <>
          {/* This component's only mobile consumer now (category.tsx) has no
              bottom nav of its own, so it can sit close to the screen edge. */}
          <div className="fixed bottom-5 left-1/2 z-50 w-[calc(100%-32px)] max-w-md -translate-x-1/2 lg:hidden">
            <button
              type="button"
              onClick={() => openCartModal("mobile")}
              className="flex h-14 w-full items-center justify-between rounded-[18px] bg-primary px-5 text-white shadow-[0_12px_30px_var(--black40)] active:scale-[0.98]"
            >
              <span className="flex min-w-0 items-center gap-2">
                <span className="flex -space-x-2">
                  {carts.slice(0, 4).map((item) => (
                    <span
                      key={item.product.id}
                      className="h-8 w-8 overflow-hidden rounded-lg border-2 border-white bg-white"
                    >
                      <img
                        src={item.product.photo || IMAGE_PLACEHOLDER_SRC}
                        alt={item.product.name}
                        onError={handleImageFallback}
                        className="h-full w-full object-cover"
                      />
                    </span>
                  ))}
                </span>
                <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-white px-1 text-xs font-extrabold leading-none text-primary">
                  {cartCount}
                </span>
                <span className="truncate text-sm font-bold">
                  {t("cart")}
                </span>
              </span>
              <span className="shrink-0 text-sm font-bold">
                {formatPrice(total)} {t("sum")}
              </span>
            </button>
          </div>

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
                <span className="mt-1 block text-xs font-medium leading-none opacity-80">
                  {formatPrice(total)} {t("sum")}
                </span>
              </span>
            </Button>
          </div>
        </>
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

