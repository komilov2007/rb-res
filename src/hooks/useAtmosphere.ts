"use client";

import { useQuery } from "@tanstack/react-query";
import { isAxiosError } from "axios";

import { getAtmosphere } from "@/apis/atmosphere";
import { REACT_QUERY_KEYS } from "@/constants/react-query-keys";
import { useShopId } from "@/hooks/useShopId";

export const useAtmosphere = () => {
  const { shopid, hasShopId } = useShopId();

  const query = useQuery({
    enabled: hasShopId,
    queryKey: [REACT_QUERY_KEYS.ATMOSPHERE, shopid],
    queryFn: () => getAtmosphere(shopid as string),
    retry: false,
  });

  const atmosphere = query.data?.data;
  const isNotFound =
    !hasShopId ||
    (isAxiosError(query.error) && query.error.response?.status === 404);

  return {
    atmosphere,
    isLoading: hasShopId && query.isPending,
    isError: query.isError && !isNotFound,
    isNotFound,
    isAvailable: Boolean(atmosphere),
    refetch: query.refetch,
  };
};
