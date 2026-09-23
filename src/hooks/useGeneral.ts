"use client";

import { getGeneral } from "@/apis/general";
import { useShopId } from "@/hooks/useShopId";
import { useQuery } from "@tanstack/react-query";
import { REACT_QUERY_KEYS } from "@/constants/react-query-keys";

export const useGeneral = () => {
  const { shopid, hasShopId } = useShopId();

  return useQuery({
    enabled: hasShopId,
    queryKey: [REACT_QUERY_KEYS.GENERAL, shopid],
    queryFn: () => getGeneral(shopid as string),
    retry: false,
  });
};
