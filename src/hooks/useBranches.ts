"use client";

import { useQuery } from "@tanstack/react-query";

import { getBranches } from "@/apis/branches";
import { useShopId } from "@/hooks/useShopId";
import { REACT_QUERY_KEYS } from "@/constants/react-query-keys";

// The shop's branch list. One query key app-wide, so every consumer shares
// the same cache entry.
export const useBranches = () => {
  const { shopid, hasShopId } = useShopId();

  return useQuery({
    enabled: hasShopId,
    queryKey: [REACT_QUERY_KEYS.BRANCHES, shopid],
    queryFn: () => getBranches(shopid as string),
  });
};
