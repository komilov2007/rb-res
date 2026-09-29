"use client";

import { useQueryClient } from "@tanstack/react-query";

import { REACT_QUERY_KEYS } from "@/constants/react-query-keys";

// What an order changes on the server: the cart (consumed by createOrder,
// or restored when an unpaid Telegram-invoice order is cancelled), the
// order lists + active-orders badge, and the profile's cashback balance.
export const useInvalidateOrderDomains = () => {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: [REACT_QUERY_KEYS.CART_LIST] });
    queryClient.invalidateQueries({ queryKey: [REACT_QUERY_KEYS.MY_ORDERS] });
    queryClient.invalidateQueries({
      queryKey: [REACT_QUERY_KEYS.ACTIVE_ORDERS_COUNT],
    });
    queryClient.invalidateQueries({ queryKey: [REACT_QUERY_KEYS.PROFILE] });
  };
};
