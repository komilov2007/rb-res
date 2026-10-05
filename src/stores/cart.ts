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
  shopId: string | null;
  bindShop: (shopId: string) => void;
  cartCount: number;
  carts: CartItemProps[];
  isCartOpen: boolean;
  cartVariant: CartVariant | null;
  removeLineKey: CartLineKey | null;
  clearCartConfirmOpen: boolean;
  pendingCheckout: boolean;
  unavailableItemIds: number[];
  setUnavailableItemIds: (unavailableItemIds: number[]) => void;
  setCarts: (carts: CartItemProps[]) => void;
  addCart: (product: ProductProps) => void;
  setCartQuantity: (lineKey: CartLineKey, quantity: number) => void;
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
      shopId: null,
      cartCount: 0,
      carts: [],
      isCartOpen: false,
      cartVariant: null,
      removeLineKey: null,
      clearCartConfirmOpen: false,
      pendingCheckout: false,
      unavailableItemIds: [],

      bindShop: (shopId) => {
        const current = get().shopId;

        if (current === shopId) return;

        if (current !== null) {
          set({ carts: [], cartCount: 0, unavailableItemIds: [] });
        }

        set({ shopId });
      },

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
        shopId: state.shopId,
        cartCount: state.cartCount,
        carts: state.carts,
      }),
      skipHydration: true,
    },
  ),
);
