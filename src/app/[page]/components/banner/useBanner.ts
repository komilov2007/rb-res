"use client";

import { getBanners } from "@/apis/banner";
import { getProductDetail } from "@/apis/products";
import { ROUTER } from "@/constants/router";
import { useShopId } from "@/hooks/useShopId";
import { openPaymentLink as openExternalLink } from "@/utils/telegram";
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

  // category → category page, product → product detail sheet, url → external
  // link; a banner with none of these is static and does nothing.
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
      // The detail sheet opens from a product object, but a banner only
      // carries the id — fetch it through the sheet's own query (shared cache).
      try {
        const response = await queryClient.fetchQuery({
          queryKey: [REACT_QUERY_KEYS.PRODUCT_DETAIL, target.id],
          queryFn: () => getProductDetail(target.id),
        });

        openProductDetail(response.data);
      } catch {
        // The global request interceptor already toasts the backend's message.
      }
      return;
    }

    // Opened synchronously within the tap (Telegram-aware, same opener the
    // order page uses), so it isn't blocked as a popup.
    openExternalLink(target.url);
  };

  return {
    t,
    banners,
    isLoading,
    handleBannerClick,
  };
};
