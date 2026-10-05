"use client";

import { useQuery } from "@tanstack/react-query";
import { usePathname } from "next/navigation";

import { getMyOrders } from "@/apis/order";
import { REACT_QUERY_KEYS } from "@/constants/react-query-keys";
import { ROUTER } from "@/constants/router";
import { useAuthStore } from "@/stores/auth";

const LIST_LIMIT = 5;

export const useActiveOrders = () => {
  const customerId = useAuthStore((state) => state.auth?.customer);

  const { data } = useQuery({
    enabled: Boolean(customerId),
    queryKey: [REACT_QUERY_KEYS.ACTIVE_ORDERS_COUNT, customerId, LIST_LIMIT],
    queryFn: () =>
      getMyOrders(customerId as number, {
        limit: LIST_LIMIT,
        offset: 0,
        is_active: true,
      }),
    refetchInterval: 30000,
  });

  return {
    count: data?.data.count ?? 0,
    orders: data?.data.results ?? [],
  };
};

export const useIsOnOrdersPage = () => {
  const pathname = usePathname();

  return (
    pathname.startsWith(ROUTER.PROFILE_ORDERS) ||
    pathname.startsWith(ROUTER.MY_ORDERS)
  );
};
