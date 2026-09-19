"use client";

import { useQuery } from "@tanstack/react-query";

import { getMyOrders } from "@/apis/order";
import { REACT_QUERY_KEYS } from "@/constants/react-query-keys";
import { useAuthStore } from "@/stores/auth";

// Same is_active filter my-orders' own list uses (usePage.ts) — just its
// `count`, so limit:1 avoids pulling the actual order rows for a value only
// the nav badge needs. Polled like the order-detail routes' own status
// queries, so the badge clears shortly after an order leaves NEW/PROGRESS.
const POLL_INTERVAL_MS = 30000;

export const useActiveOrdersCount = () => {
  const customerId = useAuthStore((state) => state.auth?.customer);

  const { data } = useQuery({
    enabled: Boolean(customerId),
    queryKey: [REACT_QUERY_KEYS.ACTIVE_ORDERS_COUNT, customerId],
    queryFn: () =>
      getMyOrders(customerId as number, {
        limit: 1,
        offset: 0,
        is_active: true,
      }),
    refetchInterval: POLL_INTERVAL_MS,
  });

  return data?.data.count ?? 0;
};
