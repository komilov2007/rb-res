"use client";

import { useQuery } from "@tanstack/react-query";
import { isAxiosError } from "axios";

import { getAtmosphere } from "@/apis/atmosphere";
import { ATMOSPHERE_MOCK_DATA } from "@/constants/atmosphere-mock";
import { REACT_QUERY_KEYS } from "@/constants/react-query-keys";
import { useShopId } from "@/hooks/useShopId";

// TODO(atmosphere-mock): API ishlaganda false qiling — so'rov qayta yoqiladi.
const ATMOSPHERE_MOCK = true;

export const useAtmosphere = () => {
  const { shopid, hasShopId } = useShopId();

  const query = useQuery({
    enabled: hasShopId && !ATMOSPHERE_MOCK,
    queryKey: [REACT_QUERY_KEYS.ATMOSPHERE, shopid],
    queryFn: () => getAtmosphere(shopid as string),
    retry: false,
  });

  if (ATMOSPHERE_MOCK) {
    return {
      atmosphere: ATMOSPHERE_MOCK_DATA,
      isLoading: false,
      isError: false,
      isNotFound: false,
      isAvailable: true,
      refetch: query.refetch,
    };
  }

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
