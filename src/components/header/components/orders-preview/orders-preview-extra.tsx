"use client";

import { EdgeTab } from "./edge-tab";
import { useActiveOrders, useIsOnOrdersPage } from "./useActiveOrders";

// Desktop "Buyurtmalarim": the edge tab (15) is always shown; the bottom
// island (14) is kept but unused. Everything is `hidden lg:*`, mobile is
// untouched.

// Rendered once in the header fragment — always the edge tab.
export const OrdersFloatingExtras = () => {
  const { count, orders } = useActiveOrders();
  const isOnOrdersPage = useIsOnOrdersPage();

  // Already looking at the orders — no need to point at them.
  if (isOnOrdersPage) return null;

  if (orders.length === 0) return null;

  return <EdgeTab count={count} orders={orders} />;
};
