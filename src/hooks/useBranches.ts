"use client";

import { useQuery } from "@tanstack/react-query";

import { getBranches } from "@/apis/branches";
import { useShopId } from "@/hooks/useShopId";

// The shop's branch list. One query key app-wide, so every consumer shares
// the same cache entry.
export const useBranches = () => {
  const { shopid, hasShopId } = useShopId();

  return useQuery({
    enabled: hasShopId,
    queryKey: ["branches", shopid],
    queryFn: () => getBranches(shopid as string),
  });
};
