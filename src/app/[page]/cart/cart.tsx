"use client";

import { Sheet, SheetContent } from "@/components/ui/sheet";

import { useCartStore } from "@/store/cart";
import CartBody from "./components/cart-body";
import CartFooter from "./components/cart-footer";
import CartHeader from "./components/cart-header";
import RemoveCartDialog from "./components/trash-dialog";
import type { CartItemProps } from "@/types/cart";

const CartDrawer = () => {
  const carts = useCartStore((state) => state.carts);
  const isCartOpen = useCartStore((state) => state.isCartOpen);
  const cartVariant = useCartStore((state) => state.cartVariant);
  const closeCartModal = useCartStore((state) => state.closeCartModal);

  const isMobile = cartVariant === "mobile";
  const total = getCartTotal(carts);

  const handleOpenChange = (open: boolean) => {
    if (!open) closeCartModal();
  };

  return (
    <>
      <Sheet open={isCartOpen} onOpenChange={handleOpenChange}>
        <SheetContent
          side={isMobile ? "bottom" : "right"}
          showCloseButton={false}
          className={getSheetClassName(isMobile)}
        >
          <CartHeader isMobile={isMobile} />
          <CartBody isMobile={isMobile} />
          {carts.length > 0 && <CartFooter isMobile={isMobile} total={total} />}
        </SheetContent>
      </Sheet>

      <RemoveCartDialog />
    </>
  );
};

const getCartTotal = (carts: CartItemProps[]) => {
  return carts.reduce((sum, item) => {
    const price = item.product.discount_price ?? item.product.price;

    return sum + price * item.quantity;
  }, 0);
};

const getSheetClassName = (isMobile: boolean) => {
  return isMobile
    ? "flex max-h-[58dvh] w-full flex-col gap-0 overflow-hidden rounded-t-[28px] border-t border-gray180 bg-white p-0"
    : "flex h-full w-[560px] max-w-[560px] flex-col gap-0 border-l border-gray180 bg-white p-0";
};

export default CartDrawer;
