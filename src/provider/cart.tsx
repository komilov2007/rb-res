"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

import { getCartList } from "@/apis/cart";
import { useAuthStore } from "@/stores/auth";
import { useCartStore } from "@/stores/cart";
import { normalizeCartItems } from "@/utils/cart";
import type { ChildrenProps } from "@/types/children";
import { REACT_QUERY_KEYS } from "@/constants/react-query-keys";

export const CartProvider = ({ children }: ChildrenProps) => {
  const customerId = useAuthStore((state) => state.auth?.customer);
  const setCarts = useCartStore((state) => state.setCarts);

  const cartQuery = useQuery({
    enabled: Boolean(customerId),
    queryKey: [REACT_QUERY_KEYS.CART_LIST, customerId],
    queryFn: () => getCartList(customerId as number),
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (!cartQuery.data) return;

    setCarts(
      normalizeCartItems(cartQuery.data.data, useCartStore.getState().carts),
    );
  }, [cartQuery.data, setCarts]);

  return children;
};
