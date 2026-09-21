import type { ProductProps } from "@/types/product";
import type { CartItemProps } from "@/types/cart";
import { create } from "zustand";
import { persist } from "zustand/middleware";

import {
  addProduct,
  decrementProduct,
  getCartCount,
  incrementProduct,
  setProductQuantity,
  withoutProduct,
} from "@/utils/cart-items";

type CartVariant = "desktop" | "mobile";
type CartStoreProps = {
  cartCount: number;
  carts: CartItemProps[];
  isCartOpen: boolean;
  cartVariant: CartVariant | null;
  removeProductId: number | null;
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
  incrementCart: (productId: number) => void;
  decrementCart: (productId: number) => void;
  setCartQuantity: (productId: number, quantity: number) => void;
  removeCart: (productId: number) => void;
  openCartModal: (variant: CartVariant) => void;
  toggleCartModal: (variant: CartVariant) => void;
  closeCartModal: () => void;
  openRemoveModal: (productId: number) => void;
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
      removeProductId: null,
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
          cartCount: getCartCount(carts),
        });
      },

      openRemoveModal: (productId) => {
        set({
          removeProductId: productId,
        });
      },

      closeRemoveModal: () => {
        set({
          removeProductId: null,
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
        const productId = get().removeProductId;

        if (productId === null) return;

        const newCarts = withoutProduct(get().carts, productId);

        set({
          carts: newCarts,
          cartCount: getCartCount(newCarts),
          removeProductId: null,
          clearCartConfirmOpen: false,
        });
      },
      clearCart: () => {
        set({
          cartCount: 0,
          carts: [],
          isCartOpen: false,
          cartVariant: null,
          removeProductId: null,
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
      removeCart: (productId) => {
        const newCarts = withoutProduct(get().carts, productId);
        set({
          carts: newCarts,
          cartCount: getCartCount(newCarts),
        });
      },
      addCart: (product) => {
        const newCarts = addProduct(get().carts, product);
        set({
          carts: newCarts,
          cartCount: getCartCount(newCarts),
        });
      },
      setCartQuantity: (productId, quantity) => {
        const newCarts = setProductQuantity(get().carts, productId, quantity);

        set({
          carts: newCarts,
          cartCount: getCartCount(newCarts),
        });
      },
      incrementCart: (productId) => {
        const newCarts = incrementProduct(get().carts, productId);
        set({
          carts: newCarts,
          cartCount: getCartCount(newCarts),
        });
      },

      decrementCart: (productId) => {
        const newCarts = decrementProduct(get().carts, productId);
        if (!newCarts) return;
        set({
          carts: newCarts,
          cartCount: getCartCount(newCarts),
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
