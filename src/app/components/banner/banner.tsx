"use client";

import { type ChangeEvent, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import "swiper/css";
import "swiper/css/pagination";
import { useBanner } from "@/app/components/banner/useBanner";
import BannerSwiper, {
  MobileBannerHeader,
  MobileSearchScreen,
} from "@/app/components/banner/components";
import { useBoolean } from "@/hooks/useBoolean";
import { useUiStore } from "@/stores/ui";
import { getSearchUrl, hasSearchValue } from "@/utils/search";

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

export default Banner;
