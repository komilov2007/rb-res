"use client";

import { getCategories } from "@/apis/categories";
import { getProducts } from "@/apis/products";
import { useShopId } from "@/hooks/useShopId";
import {
  groupProductsByCategory,
  normalizeCategories,
  sortProductGroupsByCategories,
} from "@/utils/product";
import {
  infiniteQueryOptions,
  useInfiniteQuery,
  useQuery,
} from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import { REACT_QUERY_KEYS } from "@/constants/react-query-keys";

const PRODUCTS_LIMIT = 10;

// Shared by home and the category page, so both read one cached product list.
export const productsQueryOptions = (shopid?: string) =>
  infiniteQueryOptions({
    enabled: Boolean(shopid),
    queryKey: [REACT_QUERY_KEYS.PRODUCTS, shopid],
    queryFn: ({ pageParam }) =>
      getProducts(shopid as string, {
        limit: PRODUCTS_LIMIT,
        offset: pageParam,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, pages) => {
      const loadedItems = pages.flatMap((page) => page.data.results).length;
      const totalItems = lastPage.data.count ?? 0;

      return loadedItems < totalItems
        ? pages.length * PRODUCTS_LIMIT
        : undefined;
    },
  });

export const useProduct = () => {
  const { shopid, hasShopId } = useShopId();
  // A callback ref (not a plain useRef) so the observer effect below is
  // notified exactly when the sentinel div actually mounts, instead of
  // depending on fetch state to "discover" it on a later re-render.
  const [bottomNode, setBottomNode] = useState<HTMLDivElement | null>(null);
  const bottomRef = useCallback((node: HTMLDivElement | null) => {
    setBottomNode(node);
  }, []);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isFetching,
  } = useInfiniteQuery(productsQueryOptions(shopid));
  const { data: categories } = useQuery({
    enabled: hasShopId,
    queryKey: [REACT_QUERY_KEYS.CATEGORIES, shopid],
    queryFn: () => getCategories(shopid as string),
  });

  // Read via a ref inside the observer callback rather than as effect
  // dependencies below — otherwise the IntersectionObserver got torn down
  // and rebuilt on every fetch-state change (isFetching/isFetchingNextPage
  // flip on each page load), and since observe() fires its callback
  // immediately for an already-intersecting element, every rebuild
  // re-triggered fetchNextPage right away whenever the sentinel was still
  // inside the 900px preload margin — a tight fetch loop instead of one
  // call per scroll.
  const stateRef = useRef({
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
  });
  useEffect(() => {
    stateRef.current = {
      fetchNextPage,
      hasNextPage,
      isFetching,
      isFetchingNextPage,
    };
  });

  // New products get grouped into their category's own horizontal swiper
  // (see products.tsx/category-products.tsx), not appended to the bottom of
  // the page — so loading a page often doesn't move the sentinel at all,
  // and it can stay continuously intersecting across several page loads.
  // IntersectionObserver only calls back on enter/exit transitions, so
  // without tracking this separately, everything past that first fetch
  // would never fire another callback and infinite scroll would silently
  // stall well short of the real total — the "not everything loads" bug.
  const isIntersectingRef = useRef(false);

  const maybeFetchNext = useCallback(() => {
    const current = stateRef.current;

    if (
      !isIntersectingRef.current ||
      !current.hasNextPage ||
      current.isFetching ||
      current.isFetchingNextPage
    ) {
      return;
    }

    current.fetchNextPage();
  }, []);

  // Depends only on the sentinel node itself, so the observer is created
  // once per mount and just keeps watching it — it no longer gets rebuilt
  // as pages load.
  useEffect(() => {
    if (!bottomNode) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        isIntersectingRef.current = entry?.isIntersecting ?? false;
        maybeFetchNext();
      },
      { rootMargin: "900px 0px", threshold: 0.01 },
    );

    observer.observe(bottomNode);

    return () => observer.disconnect();
  }, [bottomNode, maybeFetchNext]);

  // Re-checks after every page actually settles (`data` gets a new page),
  // since — per the comment above — the sentinel may never re-fire a
  // transition event on its own. This is what keeps scroll going all the
  // way to the real end instead of stopping after the first page that
  // doesn't move the sentinel.
  useEffect(() => {
    maybeFetchNext();
  }, [data, maybeFetchNext]);

  const products = data?.pages.flatMap((page) => page.data.results) ?? [];
  const productGroups = sortProductGroupsByCategories(
    groupProductsByCategory(products),
    normalizeCategories(categories?.data),
  );

  return {
    products,
    bottomRef,
    isLoading,
    productGroups,
    isFetchingNextPage,
  };
};
