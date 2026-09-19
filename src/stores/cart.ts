import type { ProductProps } from "@/types/product";
import type { CartItemProps } from "@/types/cart";
import { create } from "zustand";
import { persist } from "zustand/middleware";

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

const getCartCount = (carts: CartItemProps[]) => {
  return carts.reduce((total, item) => total + item.quantity, 0);
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

        const newCarts = get().carts.filter(
          (item) => item.product.id !== productId,
        );

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
        const newCarts = get().carts.filter(
          (item) => item.product.id !== productId,
        );
        set({
          carts: newCarts,
          cartCount: getCartCount(newCarts),
        });
      },
      addCart: (product) => {
        const carts = get().carts;
        const findProduct = carts.find((item) => item.product.id === product.id);
        if (findProduct) {
          const newCarts = carts.map((item) =>
            item.product.id === product.id
              ? {
                  ...item,
                  quantity: Math.min(item.quantity + 1, 999),
                }
              : item,
          );
          set({
            carts: newCarts,
            cartCount: getCartCount(newCarts),
          });
          return;
        }
        const newCarts = [
          ...carts,
          {
            product,
            quantity: 1,
          },
        ];
        set({
          carts: newCarts,
          cartCount: getCartCount(newCarts),
        });
      },
      setCartQuantity: (productId, quantity) => {
        const normalizedQuantity = Math.max(0, quantity);
        const carts = get().carts;
        const newCarts = normalizedQuantity === 0
          ? carts.filter((item) => item.product.id !== productId)
          : carts.map((item) =>
              item.product.id === productId
                ? { ...item, quantity: normalizedQuantity }
                : item,
            );

        set({
          carts: newCarts,
          cartCount: getCartCount(newCarts),
        });
      },
      incrementCart: (productId) => {
        const carts = get().carts;
        const newCarts = carts.map((item) =>
          item.product.id === productId
            ? {
                ...item,
                quantity: Math.min(item.quantity + 1, 999),
              }
            : item,
        );
        set({
          carts: newCarts,
          cartCount: getCartCount(newCarts),
        });
      },

      decrementCart: (productId) => {
        const carts = get().carts;
        const item = carts.find((item) => item.product.id === productId);
        if (!item) return;
        if (item.quantity === 1) {
          const newCarts = carts.filter((item) => item.product.id !== productId);
          set({
            carts: newCarts,
            cartCount: getCartCount(newCarts),
          });
          return;
        }
        const newCarts = carts.map((item) =>
          item.product.id === productId
            ? {
                ...item,
                quantity: item.quantity - 1,
              }
            : item,
        );
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
