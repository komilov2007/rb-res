"use client";

import Language from "@/components/language";
import { BannerSkeleton } from "@/components/ui/skleton";
import { getBannerInfoItems } from "@/constants/banner";
import { MapPin } from "lucide-react";
import "swiper/css";
import "swiper/css/pagination";
import Logo from "@/components/logo";
import { useBanner } from "@/app/[page]/components/banner/useBanner";
import BannerSwiper from "@/app/[page]/components/banner/components";
import { useLocationStore } from "@/store/location";
import MobileSearch from "@/app/[page]/components/mobile/mobile-search";
import MobileFixedHeader from "@/app/[page]/components/mobile/mobile-fixed-header";
import { useAuthStore } from "@/store/auth";

const Banner = () => {
  const address = useLocationStore((state) => state.address);
  const setLocationModal = useLocationStore((state) => state.setLocationModal);
  const hasAccess = useAuthStore((state) => state.hasAccess);
  const setLoginModal = useAuthStore((state) => state.setLoginModal);
  const {
    t,
    banners,
    isLoading,
    shopName,
    logo,
    servicesText,
    servicesTitle,
    todayWorkTime,
  } = useBanner();

  if (isLoading) return <BannerSkeleton />;
  if (banners.length === 0) return null;

  const infoItems = getBannerInfoItems({
    t,
    todayWorkTime,
    servicesTitle,
    servicesText,
  });

  const handleOpenLocation = () => {
    if (hasAccess) {
      setLocationModal(true)();
      return;
    }

    setLoginModal(true)();
  };

  return (
    <>
      <MobileFixedHeader shopName={shopName} />

      <section className="lg:hidden">
        <div className="relative h-[538px] overflow-hidden bg-black">
          <BannerSwiper banners={banners} variant="mobile" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/10 to-black/45" />

          <div className="absolute left-0 top-0 z-10  flex w-full  items-center justify-between px-4 pt-10 text-white">
            {logo ? (
              <div className="flex h-10 w-[120px] items-center px-2">
                <Logo />
              </div>
            ) : (
              <div />
            )}
            <div className="flex justify-start">
              <Language variant="hero" />
            </div>
          </div>
        </div>

        <div className="-mt-8 px-3">
          <div className="relative z-20 rounded-[18px] bg-white px-4 pb-3 pt-3 shadow-[0_4px_16px_var(--black40)]">
            <h1 className="text-[24px] font-extrabold leading-7 text-black">
              {shopName}
            </h1>

            <div className="mt-3 grid grid-cols-2 divide-x divide-gray180">
              {infoItems.map(({ icon: Icon, label, value }) => (
                <div key={value} className="min-w-0 px-2">
                  <div className="flex items-center gap-1.5">
                    <Icon size={14} className="shrink-0 text-gray220" />
                    <p className="truncate text-[11px] font-semibold leading-3 text-gray220">
                      {label}
                    </p>
                  </div>
                  <h4 className="mt-1 truncate text-[10px] font-bold leading-3 text-black">
                    {value}
                  </h4>
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={handleOpenLocation}
            className="mt-3 w-full rounded-[18px] bg-white px-4 py-3 text-left shadow-[0_4px_16px_var(--black40)]"
          >
            <div className="flex items-center gap-3">
              <div className="flex min-w-0 flex-1 items-center gap-3 text-left">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary10 text-primary">
                  <MapPin size={18} />
                </span>
                <span className="min-w-0">
                  <span className="block text-[11px] font-semibold leading-3 text-gray220">
                    {t("delivery_address")}
                  </span>
                  <span className="mt-1 block truncate text-sm font-extrabold leading-4 text-black">
                    {address || t("select_address")}
                  </span>
                </span>
              </div>
            </div>
          </button>

          <MobileSearch />
        </div>
      </section>

      <section className="hidden w-full items-center justify-center px-4 pb-4 lg:flex">
        <div className="w-full max-w-7xl">
          <div className="h-[150px] overflow-hidden rounded-xl sm:h-[190px] lg:h-[300px]">
            <BannerSwiper banners={banners} variant="desktop" />
          </div>
        </div>
      </section>
    </>
  );
};

export default Banner;
