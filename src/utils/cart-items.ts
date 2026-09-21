import type { CartItemProps } from "@/types/cart";
import type { ProductProps } from "@/types/product";

// Pure local-cart transforms used by the cart store. Each returns a new
// array; quantities are capped at 999.

const MAX_QUANTITY = 999;

export const getCartCount = (carts: CartItemProps[]) => {
  return carts.reduce((total, item) => total + item.quantity, 0);
};

export const withoutProduct = (carts: CartItemProps[], productId: number) =>
  carts.filter((item) => item.product.id !== productId);

export const incrementProduct = (carts: CartItemProps[], productId: number) =>
  carts.map((item) =>
    item.product.id === productId
      ? {
          ...item,
          quantity: Math.min(item.quantity + 1, MAX_QUANTITY),
        }
      : item,
  );

// Adds one more of an existing line, or appends the product as a new line.
export const addProduct = (carts: CartItemProps[], product: ProductProps) => {
  const findProduct = carts.find((item) => item.product.id === product.id);

  if (findProduct) return incrementProduct(carts, product.id);

  return [
    ...carts,
    {
      product,
      quantity: 1,
    },
  ];
};

// 0 (or less) removes the line.
export const setProductQuantity = (
  carts: CartItemProps[],
  productId: number,
  quantity: number,
) => {
  const normalizedQuantity = Math.max(0, quantity);

  return normalizedQuantity === 0
    ? withoutProduct(carts, productId)
    : carts.map((item) =>
        item.product.id === productId
          ? { ...item, quantity: normalizedQuantity }
          : item,
      );
};

// One less; the last one removes the line. null when the product isn't in
// the cart (nothing to change).
export const decrementProduct = (carts: CartItemProps[], productId: number) => {
  const item = carts.find((cartItem) => cartItem.product.id === productId);

  if (!item) return null;
  if (item.quantity === 1) return withoutProduct(carts, productId);

  return carts.map((cartItem) =>
    cartItem.product.id === productId
      ? {
          ...cartItem,
          quantity: cartItem.quantity - 1,
        }
      : cartItem,
  );
};
