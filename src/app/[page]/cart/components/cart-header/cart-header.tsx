import { useTranslations } from "next-intl";
import { ChevronLeft } from "lucide-react";
import { IconTrashFilled } from "@tabler/icons-react";

import XButton from "@/components/ui/x-button";
import {
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import { useCartStore } from "@/stores/cart";
import type { CartItemProps, CartViewProps } from "@/types/cart";

type CartHeaderProps = CartViewProps & {
  viewingItem: CartItemProps | null;
  onBack: () => void;
};

const CartHeader = ({ isMobile, viewingItem, onBack }: CartHeaderProps) => {
  const t = useTranslations();
  const carts = useCartStore((state) => state.carts);
  const closeCartModal = useCartStore((state) => state.closeCartModal);
  const openClearCartModal = useCartStore((state) => state.openClearCartModal);

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
        {viewingItem ? (
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1 text-sm font-medium text-black"
          >
            <ChevronLeft size={18} />
            {t("cart")}
          </button>
        ) : (
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <SheetTitle
                className={
                  isMobile
                    ? "text-lg font-medium text-black"
                    : "text-xl font-medium text-black"
                }
              >
                {t("cart")}
              </SheetTitle>

              <SheetDescription className="text20 mt-1">
                {t("cart_product_count", { count: carts.length })}
              </SheetDescription>
            </div>

            <div className="flex shrink-0 flex-col items-end gap-3 mt-[-15px]">
              <XButton size="sm" onClick={closeCartModal} />
              {carts.length > 0 && (
                <button
                  type="button"
                  onClick={openClearCartModal}
                  className="flex items-center gap-1.5 text-xs font-medium text-red transition-opacity hover:opacity-75"
                >
                  <IconTrashFilled size={15} />
                  <span>{t("clear_cart")}</span>
                </button>
              )}
            </div>
          </div>
        )}
      </SheetHeader>
    </>
  );
};

export default CartHeader;

