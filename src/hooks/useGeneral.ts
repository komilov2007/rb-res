"use client";

import { getGeneral } from "@/apis/general";
import { useShopid } from "@/hooks/useShopId";
import { useQuery } from "@tanstack/react-query";

export const useGeneral = () => {
  const { shopid, hasShopId } = useShopid();

  return useQuery({
    enabled: hasShopId,
    queryKey: ["general", shopid],
    queryFn: () => getGeneral(shopid as string),
    retry: false,
  });
};
