"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

import { getCategories } from "@/apis/categories";
import { useBranchSelection } from "@/components/branch-selection";
import { productsQueryOptions } from "@/app/[page]/components/products/useProduct";
import { useShopId } from "@/hooks/useShopId";
import type { ProductProps } from "@/types/product";
import { normalizeCategories } from "@/utils/product";
import { REACT_QUERY_KEYS } from "@/constants/react-query-keys";

export const useCategory = () => {
  const { id } = useParams<{ id: string }>();
  const categoryId = Number(id);
  const { shopid, hasShopId } = useShopId();
  const { branchId } = useBranchSelection();

  // Same query as the home product list (shared cache). No category filter
  // param is confirmed for the product-list endpoint, so every page is
  // loaded and the category is filtered client-side.
  const {
    data,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery(productsQueryOptions(shopid));
  const { data: categories } = useQuery({
    enabled: hasShopId,
    queryKey: [REACT_QUERY_KEYS.CATEGORIES, shopid],
    queryFn: () => getCategories(shopid as string),
  });

  // Stops on error: hasNextPage stays true after a failed page, so without
  // the isError guard this would refetch it forever.
  useEffect(() => {
    if (hasNextPage && !isFetchingNextPage && !isError) void fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, isError, fetchNextPage]);

  const products =
    data?.pages
      .flatMap((page) => page.data.results)
      .filter((product) => product.category?.id === categoryId) ?? [];
  const allCategories = normalizeCategories(categories?.data);
  const category = allCategories.find((item) => item.id === categoryId);
  // Same availability rule as the home product list.
  const isUnavailable = (product: ProductProps) =>
    branchId !== null && !product.branches?.includes(branchId);

  return {
    shopid,
    categoryId,
    categoryName: category?.name ?? products[0]?.category.name ?? "",
    categories: allCategories,
    products,
    isUnavailable,
    hasBranch: branchId !== null,
    availableCount: products.filter((product) => !isUnavailable(product))
      .length,
    // Wait for all pages, so the empty state never flashes mid-load.
    isLoading: isLoading || (!isError && Boolean(hasNextPage)),
  };
};
