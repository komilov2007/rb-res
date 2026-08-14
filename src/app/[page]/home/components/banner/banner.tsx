"use client";

import { BannerSkeleton } from "@/components/ui/skleton";
import DesktopBanner from "./components/desktop-banner";
import MobileBanner from "./components/mobile-banner";
import { useBanner } from "./useBanner";
import "swiper/css";
import "swiper/css/pagination";

const Banner = () => {
  const {
    t,
    banners,
    isLoading,
    shopName,
    servicesText,
    servicesTitle,
    todayWorkTime,
  } = useBanner();

  if (isLoading) return <BannerSkeleton />;
  if (banners.length === 0) return null;

  return (
    <>
      <MobileBanner
        t={t}
        banners={banners}
        shopName={shopName}
        servicesText={servicesText}
        servicesTitle={servicesTitle}
        todayWorkTime={todayWorkTime}
      />
      <DesktopBanner banners={banners} />
    </>
  );
};

export default Banner;
