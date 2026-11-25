import { isAxiosError } from "axios";

// Backend stock statuses (product and parameter sku): UNLIMITED | LIMITED | NOT_AVAILABLE.
// `amount` is the remaining stock and only meaningful for LIMITED (UNLIMITED returns 0).
type StockProps = {
  status?: string | null;
  amount?: number | null;
};

export const MAX_PRODUCT_QUANTITY = 999;

export const isLimitedStock = (item?: StockProps | null) =>
  item?.status === "LIMITED";

export const isOutOfStock = (item?: StockProps | null) =>
  item?.status === "NOT_AVAILABLE" ||
  (isLimitedStock(item) && (item?.amount ?? 0) <= 0);

// Smallest LIMITED amount among the product and its selected skus.
export const getMaxQuantity = (...items: (StockProps | null | undefined)[]) =>
  items.reduce<number>(
    (max, item) =>
      isLimitedStock(item) ? Math.min(max, Math.max(0, item?.amount ?? 0)) : max,
    MAX_PRODUCT_QUANTITY,
  );

// Cart update/stock endpoints reject an over-stock quantity with
// `{ data: { message, max_available } }` (same contract as the old rb-webapp ErrorProps).
export const getMaxAvailableFromError = (error: unknown): number | null => {
  if (!isAxiosError(error)) return null;

  const maxAvailable = (
    error.response?.data as { data?: { max_available?: unknown } } | undefined
  )?.data?.max_available;

  return typeof maxAvailable === "number" ? maxAvailable : null;
};
