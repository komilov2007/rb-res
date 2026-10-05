import type { CartItemProps } from "@/types/cart";
import type { ProductProps } from "@/types/product";

const MAX_QUANTITY = 999;

export type CartLineKey = string;

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

const isPlainProductLine = (item: CartItemProps, productId: number) =>
  item.product.id === productId && !hasParameters(item);

const withQuantity = (item: CartItemProps, quantity: number) => ({
  ...item,
  quantity: Math.min(quantity, MAX_QUANTITY),
});

export const withoutLine = (carts: CartItemProps[], key: CartLineKey) =>
  carts.filter((item) => getCartLineKey(item) !== key);

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
