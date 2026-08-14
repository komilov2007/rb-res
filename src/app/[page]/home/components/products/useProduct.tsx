"use client";

import { getCategories } from "@/apis/categories";
import { getProducts } from "@/apis/products";
import { useShopid } from "@/hooks/useShopId";
import {
  groupProductsByCategory,
  hasDiscount,
  sortProductGroupsByCategories,
} from "@/utils/product";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useRef } from "react";

const PRODUCTS_LIMIT = 10;

export const useProduct = () => {
  const { shopid, hasShopId } = useShopid();
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery({
      enabled: hasShopId,
      queryKey: ["products", shopid],
      queryFn: ({ pageParam = 0 }) =>
        getProducts(shopid as string, {
          limit: PRODUCTS_LIMIT,
          offset: pageParam,
        }),
      initialPageParam: 0,
      getNextPageParam: (lastPage, pages) => {
        return lastPage.data.next ? pages.length * PRODUCTS_LIMIT : undefined;
      },
    });
  const { data: categories } = useQuery({
    enabled: hasShopId,
    queryKey: ["categories", shopid],
    queryFn: () => getCategories(shopid as string),
  });

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;

      if (!entry.isIntersecting || !hasNextPage || isFetchingNextPage) return;

      fetchNextPage();
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage],
  );

  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();
    if (!hasNextPage) return;

    observerRef.current = new IntersectionObserver(handleObserver, {
      rootMargin: "900px 0px",
      threshold: 0,
    });

    if (bottomRef.current) {
      observerRef.current.observe(bottomRef.current);
    }

    return () => observerRef.current?.disconnect();
  }, [handleObserver, hasNextPage]);

  const products = data?.pages.flatMap((page) => page.data.results) ?? [];
  const discountProducts = products.filter(hasDiscount);
  const regularProducts = products.filter((product) => !hasDiscount(product));
  const productGroups = sortProductGroupsByCategories(
    groupProductsByCategory(regularProducts),
    categories?.data ?? [],
  );

  return {
    products,
    bottomRef,
    isLoading,
    productGroups,
    discountProducts,
    isFetchingNextPage,
  };
};
