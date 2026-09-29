"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";

import { getMyOrders } from "@/apis/order";
import { REACT_QUERY_KEYS } from "@/constants/react-query-keys";
import { useAuthStore } from "@/stores/auth";

const ORDERS_LIMIT = 16;
// INFERRED, not independently confirmed against rb-restaurant's own
// backend behavior — matches the reference's polling cadence. A one-line
// change later if 30s feels wrong once tested live.
const POLL_INTERVAL_MS = 30000;

export const useMyOrders = () => {
  const customerId = useAuthStore((state) => state.auth?.customer);
  const [isActive, setIsActive] = useState(true);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const {
    data,
    isLoading,
    isFetching,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    enabled: Boolean(customerId),
    queryKey: [REACT_QUERY_KEYS.MY_ORDERS, customerId, isActive],
    initialPageParam: 0,
    queryFn: ({ pageParam }) =>
      getMyOrders(customerId as number, {
        limit: ORDERS_LIMIT,
        offset: pageParam,
        is_active: isActive ? true : undefined,
      }),
    getNextPageParam: (lastPage, allPages) =>
      lastPage.data.next ? allPages.length * ORDERS_LIMIT : undefined,
    refetchInterval: POLL_INTERVAL_MS,
  });

  const orders = data?.pages.flatMap((page) => page.data.results) ?? [];

  // Same IntersectionObserver + sentinel pattern as the product list's own
  // useProduct.ts — established convention for infinite scroll here.
  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;

      if (
        !entry?.isIntersecting ||
        !hasNextPage ||
        isFetching ||
        isFetchingNextPage
      ) {
        return;
      }

      fetchNextPage();
    },
    [fetchNextPage, hasNextPage, isFetching, isFetchingNextPage],
  );

  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();
    if (!hasNextPage) return;

    observerRef.current = new IntersectionObserver(handleObserver, {
      rootMargin: "600px 0px",
      threshold: 0.01,
    });

    if (bottomRef.current) {
      observerRef.current.observe(bottomRef.current);
    }

    return () => observerRef.current?.disconnect();
  }, [handleObserver, hasNextPage]);

  return {
    orders,
    isActive,
    setIsActive,
    isLoading,
    isFetchingNextPage,
    bottomRef,
  };
};
