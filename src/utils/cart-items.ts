import type { CartItemProps } from "@/types/cart";
import type { ProductProps } from "@/types/product";

// Pure local-cart transforms used by the cart store. Each returns a new
// array; quantities are capped at 999.
//
// A product can sit in the cart on several lines (different parameter /
// ad-parameter picks), so line operations are keyed by the line itself
// (getCartLineKey), never by product id alone.

const MAX_QUANTITY = 999;

export type CartLineKey = string;

// The server line id when the line has one; otherwise (a local line not
// synced yet) the product id plus its parameter picks.
export const getCartLineKey = (item: CartItemProps): CartLineKey => {
  if (typeof item.id === "number") return `line:${item.id}`;

  const parameter = item.parameter?.name ?? "";
  const adParameters = (item.ad_parameter ?? [])
    .map((sku) => sku.name)
    .sort()
    .join(",");

  return `product:${item.product.id}|${parameter}|${adParameters}`;
};

const hasParameters = (item: CartItemProps) =>
  Boolean(item.parameter) || Boolean(item.ad_parameter?.length);

// The single line a product card manages: that product without any
// parameter picks (cards only handle products without parameters).
const isPlainProductLine = (item: CartItemProps, productId: number) =>
  item.product.id === productId && !hasParameters(item);

const withQuantity = (item: CartItemProps, quantity: number) => ({
  ...item,
  quantity: Math.min(quantity, MAX_QUANTITY),
});

export const withoutLine = (carts: CartItemProps[], key: CartLineKey) =>
  carts.filter((item) => getCartLineKey(item) !== key);

// 0 (or less) removes the line.
export const setLineQuantity = (
  carts: CartItemProps[],
  key: CartLineKey,
  quantity: number,
) => {
  const normalizedQuantity = Math.max(0, quantity);

  return normalizedQuantity === 0
    ? withoutLine(carts, key)
    : carts.map((item) =>
        getCartLineKey(item) === key
          ? withQuantity(item, normalizedQuantity)
          : item,
      );
};

// Adds one more of the product's plain line, or appends it as a new line.
export const addProduct = (carts: CartItemProps[], product: ProductProps) => {
  const existing = carts.find((item) => isPlainProductLine(item, product.id));

  if (existing) {
    return carts.map((item) =>
      item === existing ? withQuantity(item, item.quantity + 1) : item,
    );
  }

  return [
    ...carts,
    {
      product,
      quantity: 1,
    },
  ];
};

// Sets the quantity of a product's plain line only — lines of the same
// product with parameter picks are left alone. 0 removes that line.
export const setPlainProductQuantity = (
  carts: CartItemProps[],
  productId: number,
  quantity: number,
) => {
  const normalizedQuantity = Math.max(0, quantity);

  return normalizedQuantity === 0
    ? carts.filter((item) => !isPlainProductLine(item, productId))
    : carts.map((item) =>
        isPlainProductLine(item, productId)
          ? withQuantity(item, normalizedQuantity)
          : item,
      );
};
