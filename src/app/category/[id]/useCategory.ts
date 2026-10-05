"use client";

import { useShopCategories } from "@/hooks/useShopCategories";
import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useInfiniteQuery } from "@tanstack/react-query";

import { useBranchSelection } from "@/components/branch-selection";
import { productsQueryOptions } from "@/app/components/products/useProduct";
import { useShopId } from "@/hooks/useShopId";
import type { ProductProps } from "@/types/product";
import { normalizeCategories } from "@/utils/product";

export const useCategory = () => {
  const { id } = useParams<{ id: string }>();
  const categoryId = Number(id);
  const { shopid } = useShopId();
  const { branchId } = useBranchSelection();

  const {
    data,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery(productsQueryOptions(shopid));
  const { data: categories } = useShopCategories();

  useEffect(() => {
    if (hasNextPage && !isFetchingNextPage && !isError) void fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, isError, fetchNextPage]);

  const products =
    data?.pages
      .flatMap((page) => page.data.results)
      .filter((product) => product.category?.id === categoryId) ?? [];
  const allCategories = normalizeCategories(categories?.data);
  const category = allCategories.find((item) => item.id === categoryId);
  const isUnavailable = (product: ProductProps) =>
    branchId !== null && !product.branches?.includes(branchId);

  return {
    shopid,
    categoryId,
    categoryName: category?.name ?? products[0]?.category.name ?? "",
    categories: allCategories,
    products,
    isUnavailable,
    isLoading: isLoading || (!isError && Boolean(hasNextPage)),
  };
};
