"use client";

import { useShopCategories } from "@/hooks/useShopCategories";
import { getProducts } from "@/apis/products";
import { useShopId } from "@/hooks/useShopId";
import { useCategoryBanners } from "@/hooks/useCategoryBanners";
import { groupProductPagesByCategory, normalizeCategories, hasDiscount } from "@/utils/product";
import { infiniteQueryOptions, useInfiniteQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useRef } from "react";
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

export const Products = () => {
  const { shopid } = useShopId();
  const { branchId } = useBranchSelection();
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const { data: categories } = useShopCategories();
  const { getCategoryBanner } = useCategoryBanners();
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery(productsQueryOptions(shopid));

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage],
  );

  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();
    observerRef.current = new IntersectionObserver(handleObserver, {
      rootMargin: "600px 0px",
    });
    if (bottomRef.current) observerRef.current.observe(bottomRef.current);

    return () => observerRef.current?.disconnect();
  }, [handleObserver, isLoading]);

  if (isLoading) return <ProductsSkeleton />;

  const pages = data?.pages.map((page) => page.data.results) ?? [];
  const products = pages.flat();
  if (products.length === 0) return null;

  const productGroups = groupProductPagesByCategory(
    pages,
    normalizeCategories(categories?.data),
  );

  return (
    <section className="flex w-full items-center justify-center overflow-x-hidden px-4 pb-6 pt-0 lg:py-8">
      <div className="flex w-full max-w-7xl flex-col gap-7 lg:gap-8">
        <DiscountProducts
          products={products.filter(hasDiscount)}
          variant="discountRight2"
          saleBadgeVariant="red"
          branchId={branchId}
        />

        {productGroups.map((group) => (
          <CategoryProducts
            key={group.key}
            group={group}
            branchId={branchId}
            imageSrc={getCategoryBanner(group.id)?.mobile_photo}
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
  );
};

export type ProductsVariant = NonNullable<CardProductProps["variant"]>;
export type DiscountProductVariant = Exclude<ProductsVariant, "default">;
export type SaleBadgeVariant = NonNullable<CardProductProps["saleBadgeVariant"]>;

export default Products;
