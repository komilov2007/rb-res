import type { ProductProps } from "@/types/product";
import type { CartItemProps } from "@/types/cart";
import { create } from "zustand";
import { persist } from "zustand/middleware";

import { getActiveCartCount } from "@/utils/cart";
import {
  addProduct,
  type CartLineKey,
  setLineQuantity,
  setPlainProductQuantity,
  withoutLine,
} from "@/utils/cart-items";

type CartVariant = "desktop" | "mobile";
type CartStoreProps = {
  // Items on active lines only — the same count the checkout shows and
  // orders (badges, floating cart).
  cartCount: number;
  carts: CartItemProps[];
  isCartOpen: boolean;
  cartVariant: CartVariant | null;
  // The cart line (getCartLineKey) the remove-confirm dialog is for.
  removeLineKey: CartLineKey | null;
  clearCartConfirmOpen: boolean;
  // Set by useCartFooter's handleContinue when it has to interrupt checkout
  // to show the login modal — lets that same hook resume checkout once
  // hasAccess flips true, instead of leaving the user stranded after login.
  // Scoped to that one call site; unrelated login-modal triggers elsewhere
  // never set this, so they're unaffected.
  pendingCheckout: boolean;
  // Cart item ids createOrder reported as unavailable — set by the order
  // page's unavailable-products modal so the cart drawer can mark them.
  unavailableItemIds: number[];
  setUnavailableItemIds: (unavailableItemIds: number[]) => void;
  setCarts: (carts: CartItemProps[]) => void;
  addCart: (product: ProductProps) => void;
  // One cart line (drawer rows); 0 removes it.
  setCartQuantity: (lineKey: CartLineKey, quantity: number) => void;
  // A product card's plain (no-parameter) line only; 0 removes it.
  setProductQuantity: (productId: number, quantity: number) => void;
  openCartModal: (variant: CartVariant) => void;
  toggleCartModal: (variant: CartVariant) => void;
  closeCartModal: () => void;
  openRemoveModal: (lineKey: CartLineKey) => void;
  closeRemoveModal: () => void;
  openClearCartModal: () => void;
  closeClearCartModal: () => void;
  confirmRemoveCart: () => void;
  clearCart: () => void;
  setPendingCheckout: (pendingCheckout: boolean) => void;
};

export const useCartStore = create<CartStoreProps>()(
  persist(
    (set, get) => ({
      cartCount: 0,
      carts: [],
      isCartOpen: false,
      cartVariant: null,
      removeLineKey: null,
      clearCartConfirmOpen: false,
      pendingCheckout: false,
      unavailableItemIds: [],

      setPendingCheckout: (pendingCheckout) => {
        set({ pendingCheckout });
      },

      setUnavailableItemIds: (unavailableItemIds) => {
        set({ unavailableItemIds });
      },

      setCarts: (carts) => {
        set({
          carts,
          cartCount: getActiveCartCount(carts),
        });
      },

      openRemoveModal: (lineKey) => {
        set({
          removeLineKey: lineKey,
        });
      },

      closeRemoveModal: () => {
        set({
          removeLineKey: null,
        });
      },

      openClearCartModal: () => {
        set({
          clearCartConfirmOpen: true,
        });
      },

      closeClearCartModal: () => {
        set({
          clearCartConfirmOpen: false,
        });
      },

      confirmRemoveCart: () => {
        const lineKey = get().removeLineKey;

        if (lineKey === null) return;

        const newCarts = withoutLine(get().carts, lineKey);

        set({
          carts: newCarts,
          cartCount: getActiveCartCount(newCarts),
          removeLineKey: null,
          clearCartConfirmOpen: false,
        });
      },
      clearCart: () => {
        set({
          cartCount: 0,
          carts: [],
          isCartOpen: false,
          cartVariant: null,
          removeLineKey: null,
          clearCartConfirmOpen: false,
          pendingCheckout: false,
          unavailableItemIds: [],
        });
      },
      openCartModal: (variant) => {
        set({
          isCartOpen: true,
          cartVariant: variant,
        });
      },
      closeCartModal: () => {
        set({
          isCartOpen: false,
        });
      },
      toggleCartModal: (variant: CartVariant) => {
        set((state) => ({
          isCartOpen: !state.isCartOpen,
          cartVariant: state.isCartOpen ? null : variant,
        }));
      },
      addCart: (product) => {
        const newCarts = addProduct(get().carts, product);
        set({
          carts: newCarts,
          cartCount: getActiveCartCount(newCarts),
        });
      },
      setCartQuantity: (lineKey, quantity) => {
        const newCarts = setLineQuantity(get().carts, lineKey, quantity);

        set({
          carts: newCarts,
          cartCount: getActiveCartCount(newCarts),
        });
      },
      setProductQuantity: (productId, quantity) => {
        const newCarts = setPlainProductQuantity(
          get().carts,
          productId,
          quantity,
        );

        set({
          carts: newCarts,
          cartCount: getActiveCartCount(newCarts),
        });
      },
    }),
    {
      name: "cart",
      partialize: (state) => ({
        cartCount: state.cartCount,
        carts: state.carts,
      }),
    },
  ),
);
