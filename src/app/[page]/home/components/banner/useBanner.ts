"use client";

import { getBanners } from "@/apis/banner";
import { useGeneral } from "@/hooks/useGeneral";
import { useShopid } from "@/hooks/useShopId";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import {
  getServicesText,
  getServicesTitle,
  getTodayWorkTime,
} from "./banner.utils";

export const useBanner = () => {
  const { shopid, hasShopId } = useShopid();
  const t = useTranslations();
  const { data: general } = useGeneral();
  const { data, isLoading } = useQuery({
    enabled: hasShopId,
    queryKey: ["banners", shopid],
    queryFn: () => getBanners(shopid as string),
  });

  const banners = data?.data ?? [];
  const shop = general?.data;

  return {
    t,
    shop,
    banners,
    isLoading,
    shopName: shop?.name ?? "Restaurant",
    todayWorkTime: getTodayWorkTime(shop?.working_time, t),
    servicesTitle: getServicesTitle(shop, t),
    servicesText: getServicesText(shop, t),
  };
};
