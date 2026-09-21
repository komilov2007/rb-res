
import { formatPrice } from "@/utils/format-price";
import type { CartItemProps } from "@/types/cart";

// Confirmed live against GET webapp/card/list/{customer}: an authenticated
// cart item's parameter/ad_parameter come back as {name, status, amount}
// (no id) — and a guest/local item carries the full ProductSkuProps object
// (built client-side in product-detail.tsx's handleAdd). Both real shapes
// always carry `.name` directly, so no id-based lookup against the
// product's own parameter definitions is actually needed.
export const getSelectedParameterNames = (item: CartItemProps): string[] =>
  [item.parameter, ...(item.ad_parameter ?? [])]
    .map((value) => value?.name)
    .filter((name): name is string => Boolean(name));

export const getSaleLabel = (
  product: CartItemProps["product"],
  sumLabel: string,
) =>
  product.sale_type === "PERCENT"
    ? `-${product.sale_amount}%`
    : `-${formatPrice(product.sale_amount ?? 0)} ${sumLabel}`;
