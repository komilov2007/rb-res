"use client";

import { getBanners } from "@/apis/banner";
import { getProductDetail } from "@/apis/products";
import { ROUTER } from "@/constants/router";
import { useShopId } from "@/hooks/useShopId";
import { openExternalLink } from "@/utils/telegram";
import { useProductDetailStore } from "@/stores/product-detail";
import type { BannerProps } from "@/types/banner";
import { getBannerTarget } from "@/utils/banner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { REACT_QUERY_KEYS } from "@/constants/react-query-keys";

export const useBanner = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { shopid, hasShopId } = useShopId();
  const t = useTranslations();
  const openProductDetail = useProductDetailStore(
    (state) => state.openProductDetail,
  );
  const { data, isLoading } = useQuery({
    enabled: hasShopId,
    queryKey: [REACT_QUERY_KEYS.BANNERS, shopid],
    queryFn: () => getBanners(shopid as string),
  });

  const banners = data?.data ?? [];

  const handleBannerClick = async (banner: BannerProps) => {
    const target = getBannerTarget(banner);

    if (!target) return;

    if (target.type === "category") {
      router.push(
        `${ROUTER.CATEGORY}/${target.id}${shopid ? `?shop_id=${shopid}` : ""}`,
      );
      return;
    }

    if (target.type === "product") {
      try {
        const response = await queryClient.fetchQuery({
          queryKey: [REACT_QUERY_KEYS.PRODUCT_DETAIL, target.id],
          queryFn: () => getProductDetail(target.id),
        });

        openProductDetail(response.data);
      } catch {
      }
      return;
    }

    openExternalLink(target.url);
  };

  return {
    t,
    banners,
    isLoading,
    handleBannerClick,
  };
};
