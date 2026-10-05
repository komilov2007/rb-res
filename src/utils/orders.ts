import { ROUTER } from "@/constants/router";

const withQuery = (path: string, params: Record<string, string | null>) => {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value) query.set(key, value);
  });

  const search = query.toString();

  return `${path}${search ? `?${search}` : ""}`;
};

export const getProfileOrdersUrl = (
  shopid?: string | null,
  orderId?: number | string | null,
) =>
  withQuery(ROUTER.PROFILE_ORDERS, {
    shop_id: shopid ?? null,
    order:
      orderId !== null && orderId !== undefined && orderId !== ""
        ? String(orderId)
        : null,
  });

export const getOrderDetailUrl = (
  isDesktop: boolean,
  shopid: string | null | undefined,
  orderId: number | string | null | undefined,
) =>
  isDesktop
    ? getProfileOrdersUrl(shopid, orderId)
    : withQuery(`${ROUTER.MY_ORDERS}/${orderId}`, { shop_id: shopid ?? null });

export const getPlacedOrderUrl = (
  isDesktop: boolean,
  shopid: string | null | undefined,
  orderId: number | string | null | undefined,
) =>
  isDesktop
    ? getProfileOrdersUrl(shopid, orderId)
    : withQuery(`${ROUTER.ORDER_PLACING}/${orderId}`, {
        shop_id: shopid ?? null,
      });
