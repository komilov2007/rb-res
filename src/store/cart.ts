import type { ProductProps } from "@/types/product";
import { create } from "zustand";

type CartItemProps = {
  product: ProductProps;
  quantity: number;
};

type CartStoreProps = {
  cartCount: number;
  carts: CartItemProps[];
  addCart: (product: ProductProps) => void;
  incrementCart: (productId: number) => void;
  decrementCart: (productId: number) => void;
};

const getCartCount = (carts: CartItemProps[]) => {
  return carts.reduce((total, item) => total + item.quantity, 0);
};

export const useCartStore = create<CartStoreProps>()((set, get) => ({
  cartCount: 0,
  carts: [],

  addCart: (product) => {
    const carts = get().carts;
    const findProduct = carts.find((item) => item.product.id === product.id);

    if (findProduct) {
      const newCarts = carts.map((item) =>
        item.product.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item,
      );

      set({ carts: newCarts, cartCount: getCartCount(newCarts) });

      return;
    }

    const newCarts = [...carts, { product, quantity: 1 }];

    set({
      carts: newCarts,
      cartCount: getCartCount(newCarts),
    });
  },
  incrementCart: (productId) => {
    const carts = get().carts;

    const newCarts = carts.map((item) =>
      item.product.id === productId
        ? { ...item, quantity: item.quantity + 1 }
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
        ? { ...item, quantity: item.quantity - 1 }
        : item,
    );

    set({
      carts: newCarts,
      cartCount: getCartCount(newCarts),
    });
  },
}));
