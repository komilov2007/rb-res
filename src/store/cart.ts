import type { ProductProps } from "@/types/product";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type CartItemProps = {
  product: ProductProps;
  quantity: number;
};
type CartVariant = "desktop" | "mobile";
type CartStoreProps = {
  cartCount: number;
  carts: CartItemProps[];
  isCartOpen: boolean;
  cartVariant: CartVariant | null;
  removeProductId: number | null;
  addCart: (product: ProductProps) => void;
  incrementCart: (productId: number) => void;
  decrementCart: (productId: number) => void;
  removeCart: (productId: number) => void;
  openCartModal: (variant: CartVariant) => void;
  toggleCartModal: (variant: CartVariant) => void;
  closeCartModal: () => void;
  openRemoveModal: (productId: number) => void;
  closeRemoveModal: () => void;
  confirmRemoveCart: () => void;
  clearCart: () => void;
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
        });
      },
      clearCart: () => {
        set({
          cartCount: 0,
          carts: [],
          isCartOpen: false,
          cartVariant: null,
          removeProductId: null,
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
                  quantity: item.quantity + 1,
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
      incrementCart: (productId) => {
        const carts = get().carts;
        const newCarts = carts.map((item) =>
          item.product.id === productId
            ? {
                ...item,
                quantity: item.quantity + 1,
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
