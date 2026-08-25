import { useTranslations } from "next-intl";

import XButton from "@/components/ui/x-button";
import {
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import { useCartStore } from "@/store/cart";
import type { CartViewProps } from "@/types/cart";

const CartHeader = ({ isMobile }: CartViewProps) => {
  const t = useTranslations();
  const carts = useCartStore((state) => state.carts);
  const closeCartModal = useCartStore((state) => state.closeCartModal);

  return (
    <>
      {isMobile && (
        <div className="flex shrink-0 justify-center pt-2.5">
          <span className="h-1 w-10 rounded-full bg-gray180" />
        </div>
      )}

      <SheetHeader
        className={
          isMobile
            ? "shrink-0 px-4 pb-4 pt-3"
            : "shrink-0 border-b border-gray180 px-6 py-5"
        }
      >
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <SheetTitle
              className={
                isMobile
                  ? "text-lg font-extrabold text-black"
                  : "text-xl font-extrabold text-black"
              }
            >
              {t("cart")}
            </SheetTitle>

            <SheetDescription className="text20 mt-1">
              {t("cart_product_count", { count: carts.length })}
            </SheetDescription>
          </div>

          <XButton size="sm" onClick={closeCartModal} />
        </div>
      </SheetHeader>
    </>
  );
};

export default CartHeader;
