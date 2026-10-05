"use client";

import { useQuery } from "@tanstack/react-query";

import { getMyOrders } from "@/apis/order";
import { REACT_QUERY_KEYS } from "@/constants/react-query-keys";
import { useAuthStore } from "@/stores/auth";

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
