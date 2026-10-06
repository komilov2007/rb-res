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
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { REACT_QUERY_KEYS } from "@/constants/react-query-keys";
import { type ChangeEvent, useEffect, useState } from "react";
import BannerSwiper, { MobileBannerHeader, MobileSearchScreen } from "@/app/components/banner/components";
import { useBoolean } from "@/hooks/useBoolean";
import { useUiStore } from "@/stores/ui";
import { getSearchUrl, hasSearchValue } from "@/utils/search";
import "swiper/css";
import "swiper/css/pagination";

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

const isMobileViewport = () =>
  typeof window !== "undefined" &&
  !window.matchMedia("(min-width: 1024px)").matches;

const Banner = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const urlSearch = searchParams.get("search") ?? "";
  const setMobileHeaderDrawerOpen = useUiStore(
    (state) => state.setMobileHeaderDrawerOpen,
  );
  const searchModal = useBoolean();
  const openSearchModal = searchModal.setTrue;
  const [initialSearch] = useState(urlSearch);

  useEffect(() => {
    if (hasSearchValue(initialSearch) && isMobileViewport()) openSearchModal();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [searchValue, setSearchValue] = useState(urlSearch);
  const { t, banners, isLoading, handleBannerClick } = useBanner();

  useEffect(() => {
    setMobileHeaderDrawerOpen(searchModal.value);

    return () => setMobileHeaderDrawerOpen(false);
  }, [searchModal.value, setMobileHeaderDrawerOpen]);

  const replaceSearchUrl = (search: string) => {
    router.replace(getSearchUrl({ pathname, search, searchParams }), {
      scroll: false,
    });
  };

  const handleSearch = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchValue(event.target.value);
    replaceSearchUrl(event.target.value);
  };

  const handleClearSearch = () => {
    setSearchValue("");
    replaceSearchUrl("");
  };

  const handleCloseSearch = () => {
    searchModal.setFalse();
    handleClearSearch();
  };
  const hasBanners = banners.length > 0;
  return (
    <>
      <section className="bg-white px-4 pb-4 lg:hidden">
        <MobileBannerHeader
          searchLabel={t("search_products")}
          onOpenSearch={searchModal.setTrue}
        />
        <div className="h-16" />

        {(isLoading || hasBanners) && (
          <div
            className={`mt-3 h-[200px] transition-[box-shadow,transform] duration-300 ease-out ${
              banners.length > 2
                ? "-mx-4 -mb-3 overflow-hidden"
                : "overflow-hidden rounded-[16px]"
            }`}
          >
            {isLoading ? (
              <div className="skeleton h-full w-full" />
            ) : (
              <BannerSwiper
                banners={banners}
                variant="mobile"
                onBannerClick={handleBannerClick}
              />
            )}
          </div>
        )}
      </section>

      <MobileSearchScreen
        open={searchModal.value}
        value={searchValue}
        placeholder={t("search_food_or_category")}
        onClose={handleCloseSearch}
        onClear={handleClearSearch}
        onChange={handleSearch}
      />
      {(isLoading || hasBanners) && (
        <section
          className={`hidden w-full items-center justify-center pb-4 lg:flex ${
            banners.length > 2 ? "overflow-hidden px-0" : "px-4"
          }`}
        >
          <div className={banners.length > 2 ? "w-full" : "w-full max-w-7xl"}>
            <div
              className={`h-[410px] transition-[box-shadow,transform] duration-300 ease-out ${
                banners.length > 2
                  ? "overflow-visible"
                  : "overflow-hidden rounded-xl"
              }`}
            >
              {isLoading ? (
                <div className="skeleton h-full w-full" />
              ) : (
                <BannerSwiper
                  banners={banners}
                  variant="desktop"
                  onBannerClick={handleBannerClick}
                />
              )}
            </div>
          </div>
        </section>
      )}
    </>
  );
};

export { Banner };

export default Banner;
