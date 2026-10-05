"use client";

import { useQueryClient } from "@tanstack/react-query";

import { getCartList } from "@/apis/cart";
import { REACT_QUERY_KEYS } from "@/constants/react-query-keys";
import { useAuthStore } from "@/stores/auth";
import { useCartStore } from "@/stores/cart";
import { normalizeCartItems } from "@/utils/cart";

export const useRefreshCart = () => {
  const queryClient = useQueryClient();
  const customerId = useAuthStore((state) => state.auth?.customer);
  const setCarts = useCartStore((state) => state.setCarts);

  return async () => {
    if (!customerId) return;

    const response = await queryClient.fetchQuery({
      queryKey: [REACT_QUERY_KEYS.CART_LIST, customerId],
      queryFn: () => getCartList(customerId),
      staleTime: 0,
    });

    setCarts(normalizeCartItems(response.data, useCartStore.getState().carts));
  };
};
