"use client";

import { useEffect, useLayoutEffect } from "react";
import { useQuery } from "@tanstack/react-query";

import { getCartList } from "@/apis/cart";
import { useShopId } from "@/hooks/useShopId";
import { useAuthStore } from "@/stores/auth";
import { useCartStore } from "@/stores/cart";
import { normalizeCartItems } from "@/utils/cart";
import type { ChildrenProps } from "@/types/children";
import { REACT_QUERY_KEYS } from "@/constants/react-query-keys";

export const CartProvider = ({ children }: ChildrenProps) => {
  const { shopid } = useShopId();
  const customerId = useAuthStore((state) => state.auth?.customer);
  const setCarts = useCartStore((state) => state.setCarts);
  const bindShop = useCartStore((state) => state.bindShop);

  // The persisted cart is loaded here (see the store's skipHydration). A
  // layout effect, so it lands before any child's regular effect reads it.
  useLayoutEffect(() => {
    void useCartStore.persist.rehydrate();
  }, []);

  useLayoutEffect(() => {
    if (shopid) bindShop(shopid);
  }, [shopid, bindShop]);

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
