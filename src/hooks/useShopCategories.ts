"use client";

import { useQuery } from "@tanstack/react-query";

import { getCategories } from "@/apis/categories";
import { REACT_QUERY_KEYS } from "@/constants/react-query-keys";
import { useShopId } from "@/hooks/useShopId";

// The shop's category list. One query key app-wide (home strip, catalog,
// category page, search), so every consumer shares the same cache entry.
export const useShopCategories = (enabled = true) => {
  const { shopid, hasShopId } = useShopId();

  return useQuery({
    enabled: enabled && hasShopId,
    queryKey: [REACT_QUERY_KEYS.CATEGORIES, shopid],
    queryFn: () => getCategories(shopid as string),
  });
};
