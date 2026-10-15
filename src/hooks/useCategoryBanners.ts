"use client";

import { useQuery } from "@tanstack/react-query";

import { getBanners } from "@/apis/banner";
import { REACT_QUERY_KEYS } from "@/constants/react-query-keys";
import { useShopId } from "@/hooks/useShopId";

export const useCategoryBanners = () => {
  const { shopid, hasShopId } = useShopId();

  const { data } = useQuery({
    enabled: hasShopId,
    queryKey: [REACT_QUERY_KEYS.CATEGORY_BANNERS, shopid],
    queryFn: () => getBanners(shopid as string, { type: "CATEGORY" }),
  });

  const banners = data?.data ?? [];

  const getCategoryBanner = (categoryId: number | string) =>
    banners.find((banner) => String(banner.category) === String(categoryId));

  return { getCategoryBanner };
};
