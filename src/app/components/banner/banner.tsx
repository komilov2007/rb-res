"use client";

import { type ChangeEvent, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import "swiper/css";
import "swiper/css/pagination";
import { useBanner } from "@/app/[page]/components/banner/useBanner";
import BannerSwiper, {
  MobileBannerHeader,
  MobileSearchScreen,
} from "@/app/[page]/components/banner/components";
import { useBoolean } from "@/hooks/useBoolean";
import { useUiStore } from "@/stores/ui";
import { getSearchUrl, hasSearchValue } from "@/utils/search";

// Reopens the mobile search screen on reload when the URL still carries a
// search. Mobile only — on desktop the header popover owns ?search= and this
// (lg:hidden) screen must stay closed.
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
  // Starts closed on both server and client (the viewport is only known in
  // the browser — reading it here made the first render differ from the
  // server HTML); the effect below reopens it after mount.
  const searchModal = useBoolean();
  const openSearchModal = searchModal.setTrue;
  const [initialSearch] = useState(urlSearch);

  useEffect(() => {
    if (hasSearchValue(initialSearch) && isMobileViewport()) openSearchModal();
    // Mount only: reopening on later URL changes would fight the user
    // closing the screen.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // Local state drives the input so typing stays instant; the URL is kept in
  // sync alongside it (replace, not push — one history entry per keystroke
  // would make the back button walk through every letter).
  const [searchValue, setSearchValue] = useState(urlSearch);
  const { t, banners, isLoading, handleBannerClick } = useBanner();

  useEffect(() => {
    // The search screen no longer sits above MobileAction's z-[70] widget
    // (see MobileSearchScreen), so that widget is hidden while it's open.
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
