"use client";

import { useQuery } from "@tanstack/react-query";

import { getBranches } from "@/apis/branches";
import { useShopId } from "@/hooks/useShopId";
import { REACT_QUERY_KEYS } from "@/constants/react-query-keys";

export const useBranches = () => {
  const { shopid, hasShopId } = useShopId();

  return useQuery({
    enabled: hasShopId,
    queryKey: [REACT_QUERY_KEYS.BRANCHES, shopid],
    queryFn: () => getBranches(shopid as string),
  });
};
