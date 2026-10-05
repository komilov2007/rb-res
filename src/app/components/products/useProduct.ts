"use client";

import { useShopCategories } from "@/hooks/useShopCategories";
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
} from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import { REACT_QUERY_KEYS } from "@/constants/react-query-keys";

const PRODUCTS_LIMIT = 10;

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
  const { shopid } = useShopId();
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
  const { data: categories } = useShopCategories();

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
