import { formatPrice } from "@/utils/format-price";
import type { CartItemProps } from "@/types/cart";

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
