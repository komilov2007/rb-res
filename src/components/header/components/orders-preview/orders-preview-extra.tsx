"use client";

import { EdgeTab } from "./edge-tab";
import { useActiveOrders, useIsOnOrdersPage } from "./useActiveOrders";

export const OrdersFloatingExtras = () => {
  const { count, orders } = useActiveOrders();
  const isOnOrdersPage = useIsOnOrdersPage();

  if (isOnOrdersPage) return null;

  if (orders.length === 0) return null;

  return <EdgeTab count={count} orders={orders} />;
};
