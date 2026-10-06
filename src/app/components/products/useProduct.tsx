"use client";

import { useShopCategories } from "@/hooks/useShopCategories";
import { getProducts } from "@/apis/products";
import { useShopId } from "@/hooks/useShopId";
import { groupProductsByCategory, normalizeCategories, sortProductGroupsByCategories, hasDiscount } from "@/utils/product";
import { infiniteQueryOptions, useInfiniteQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import { REACT_QUERY_KEYS } from "@/constants/react-query-keys";
import { ProductsSkeleton } from "@/components/ui/skeleton";
import { useBranchSelection } from "@/components/branch-selection";
import { CategoryProducts, DiscountProducts } from "@/app/components/products/components/index";
import "swiper/css";
import type { CardProductProps } from "@/types/product";

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

const Products = () => {
  const { products, bottomRef, isLoading, productGroups, isFetchingNextPage } =
    useProduct();
  const { branchId } = useBranchSelection();

  if (isLoading) return <ProductsSkeleton />;
  if (products.length === 0) return null;

  const discountProducts = products.filter(hasDiscount);

  return (
    <>
      <section className="flex w-full items-center justify-center overflow-x-hidden px-4 pb-6 pt-0 lg:py-8">
        <div className="flex w-full max-w-7xl flex-col gap-7 lg:gap-8">
          <DiscountProducts
            products={discountProducts}
            variant="discountRight2"
            saleBadgeVariant="red"
            branchId={branchId}
          />

          {productGroups.map((group, index) => (
            <CategoryProducts
              key={group.id}
              group={group}
              branchId={branchId}
              videoSrc={
                index === 0
                  ? "/banner.mp4"
                  : index === 1
                    ? "/banner2.mp4"
                    : undefined
              }
            />
          ))}

          <div ref={bottomRef} className="h-px" />
          {isFetchingNextPage && (
            <div className="opacity-80">
              <ProductsSkeleton />
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export type ProductsVariant = NonNullable<CardProductProps["variant"]>;
export type DiscountProductVariant = Exclude<ProductsVariant, "default">;
export type SaleBadgeVariant = NonNullable<CardProductProps["saleBadgeVariant"]>;

export { Products };

export default Products;
