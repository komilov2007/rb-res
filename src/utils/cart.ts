import type { ApiCartItemProps, CartItemProps } from "@/types/cart";
import type { CartListResponse } from "@/apis/cart";

export const getCartTotal = (carts: CartItemProps[]) => {
  return carts.reduce((sum, item) => {
    const price = item.product.discount_price ?? item.product.price;

    return sum + price * item.quantity;
  }, 0);
};

export const normalizeCartItems = (
  data: CartListResponse,
  currentItems: CartItemProps[] = [],
): CartItemProps[] => {
  const items = Array.isArray(data)
    ? data
    : Array.isArray(data.results)
      ? data.results
      : Array.isArray(data.data)
        ? data.data
        : [];

  return items.map((item) =>
    normalizeCartItem(
      item as ApiCartItemProps,
      currentItems.find(
        (currentItem) =>
          currentItem.product.id === (item as ApiCartItemProps).product.id,
      ),
    ),
  );
};

// Confirmed live against GET webapp/card/list/{customer}: the response
// always carries parameter/ad_parameter (as {name, status, amount} / null,
// no id) — read them directly rather than falling back to a prior
// client-side value, since a `?? currentItem?.parameter` fallback would
// incorrectly resurrect stale data whenever the server legitimately
// returns null (e.g. a non-parameterized product's cart line).
const normalizeCartItem = (
  item: ApiCartItemProps,
  currentItem?: CartItemProps,
): CartItemProps => {
  const currentProduct = currentItem?.product;

  return {
    id: item.id,
    is_active: item.is_active,
    parameter: item.parameter,
    ad_parameter: item.ad_parameter,
    product: {
      ...currentProduct,
      id: item.product.id,
      name: item.product.name,
      price: item.amount / Math.max(item.quantity, 1),
      description: currentProduct?.description ?? null,
      photo: item.product.photo,
      photo1: currentProduct?.photo1 ?? null,
      is_xit: currentProduct?.is_xit ?? false,
      have_parameter: currentProduct?.have_parameter ?? false,
      sale_type: currentProduct?.sale_type ?? null,
      sale_amount: currentProduct?.sale_amount ?? null,
      discount_price: currentProduct?.discount_price ?? null,
      status: item.product.status,
      category: currentProduct?.category ?? {
        id: 0,
        name: "",
      },
      amount: item.product.amount,
      branches: item.product.branches ?? currentProduct?.branches ?? [],
    },
    quantity: item.quantity,
  };
};
