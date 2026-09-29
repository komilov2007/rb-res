import type { BannerProps } from "@/types/banner";
import { getImageSrc, handleImageFallback } from "@/utils/image";
import { getBannerTarget } from "@/utils/banner";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRef } from "react";
import { Autoplay } from "swiper/modules";
import type { Swiper as SwiperClass } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";

type BannerSwiperProps = {
  banners: BannerProps[];
  variant: "mobile" | "desktop";
  onBannerClick?: (banner: BannerProps) => void;
};

const BannerSwiper = ({
  banners,
  variant,
  onBannerClick,
}: BannerSwiperProps) => {
  const t = useTranslations();
  const swiperRef = useRef<SwiperClass | null>(null);
  const isDesktop = variant === "desktop";
  const isNavigationLayout = banners.length > 2;

  // Only banners with a category/product/url target are tappable; Swiper's
  // default preventClicks keeps a swipe from counting as a tap.
  const getSlideClickProps = (banner: BannerProps) =>
    getBannerTarget(banner) && onBannerClick
      ? {
          onClick: () => onBannerClick(banner),
          "data-banner-clickable": true,
        }
      : {};

  if (isNavigationLayout) {
    const repeatedBanners = [...banners, ...banners, ...banners];
    const resetPosition = (swiper: SwiperClass) => {
      if (swiper.activeIndex < banners.length) {
        swiper.slideTo(swiper.activeIndex + banners.length, 0);
      }

      if (swiper.activeIndex >= banners.length * 2) {
        swiper.slideTo(swiper.activeIndex - banners.length, 0);
      }
    };

    return (
      <div
        className={`relative h-full w-full bg-white/80 ${
          isDesktop ? "overflow-hidden" : "overflow-visible"
        }`}
      >
        <Swiper
          grabCursor
          simulateTouch
          centeredSlides
          slidesPerView="auto"
          spaceBetween={isDesktop ? 24 : 10}
          speed={650}
          initialSlide={banners.length}
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
          }}
          onSlideChangeTransitionEnd={resetPosition}
          className={`w-full ${
            isDesktop ? "h-full" : "h-full !overflow-visible pb-3"
          }`}
        >
          {repeatedBanners.map((banner, index) => (
            <SwiperSlide
              key={`${banner.id}-${index}`}
              {...getSlideClickProps(banner)}
              className={`${
                isDesktop ? "!w-[min(1280px,74vw)]" : "!relative !w-[90%] pb-3"
              } ${getBannerTarget(banner) ? "cursor-pointer" : ""}`}
            >
              {({ isActive }) =>
                isDesktop ? (
                  <picture
                    className={`block w-full overflow-hidden rounded-xl transition-opacity duration-500 ${
                      isActive
                        ? "h-full opacity-100"
                        : "h-[calc(100%-10px)] opacity-55"
                    }`}
                  >
                    <source
                      media="(min-width: 1024px)"
                      srcSet={getImageSrc(banner.desktop_photo, banner.mobile_photo)}
                    />
                    <img
                      draggable={false}
                      className="h-full w-full object-cover shadow-2xs"
                      src={getImageSrc(banner.mobile_photo, banner.desktop_photo)}
                      onError={handleImageFallback}
                      alt={t("home_banner_alt")}
                    />
                  </picture>
                ) : (
                  <img
                    draggable={false}
                    className={`h-full w-full rounded-[16px] object-cover transition-opacity duration-500 shadow-2xs ${
                      isActive ? "opacity-100" : "opacity-55"
                    }`}
                    src={getImageSrc(banner.mobile_photo, banner.desktop_photo)}
                    onError={handleImageFallback}
                    alt={t("home_banner_alt")}
                  />
                )
              }
            </SwiperSlide>
          ))}
        </Swiper>
        <button
          type="button"
          onClick={() => swiperRef.current?.slidePrev()}
          className={`absolute top-1/2 z-10 flex -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-black transition-transform hover:scale-105 ${
            isDesktop
              ? "left-[calc(50%-min(640px,37vw)-74px)] h-11 w-11"
              : "left-8 h-10 w-10"
          }`}
          aria-label={t("home_prev_banner")}
        >
          <ChevronLeft size={isDesktop ? 24 : 20} strokeWidth={2.5} />
        </button>
        <button
          type="button"
          onClick={() => swiperRef.current?.slideNext()}
          className={`absolute top-1/2 z-10 flex -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-black transition-transform hover:scale-105 ${
            isDesktop
              ? "right-[calc(50%-min(640px,37vw)-74px)] h-11 w-11"
              : "right-8 h-10 w-10"
          }`}
          aria-label={t("home_next_banner")}
        >
          <ChevronRight size={isDesktop ? 24 : 20} strokeWidth={2.5} />
        </button>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      <Swiper
        grabCursor
        simulateTouch
        loop={banners.length > 1}
        slidesPerView={1}
        autoplay={
          banners.length > 1
            ? {
                delay: 3000,
                disableOnInteraction: false,
              }
            : false
        }
        modules={[Autoplay]}
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
        }}
        className="h-full w-full"
      >
        {banners.map((banner) => (
          <SwiperSlide
            key={banner.id}
            {...getSlideClickProps(banner)}
            className={`h-full ${getBannerTarget(banner) ? "cursor-pointer" : ""}`}
          >
            {isDesktop ? (
              <picture className="block h-full w-full">
                <source
                  media="(min-width: 1024px)"
                  srcSet={getImageSrc(banner.desktop_photo, banner.mobile_photo)}
                />
                <img
                  draggable={false}
                  className="h-full w-full object-cover shadow-2xs"
                  src={getImageSrc(banner.mobile_photo, banner.desktop_photo)}
                  onError={handleImageFallback}
                  alt={t("home_banner_alt")}
                />
              </picture>
            ) : (
              <img
                draggable={false}
                className="h-full w-full rounded-[16px] object-cover opacity-90 shadow-2xs"
                src={getImageSrc(banner.mobile_photo, banner.desktop_photo)}
                onError={handleImageFallback}
                alt={t("home_banner_alt")}
              />
            )}
          </SwiperSlide>
        ))}
      </Swiper>

      {!isDesktop && banners.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => swiperRef.current?.slidePrev()}
            className="absolute left-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-black shadow-[0_6px_18px_rgba(17,24,39,0.14)] active:scale-95"
            aria-label={t("home_prev_banner")}
          >
            <ChevronLeft size={20} strokeWidth={2.5} />
          </button>
          <button
            type="button"
            onClick={() => swiperRef.current?.slideNext()}
            className="absolute right-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-black shadow-[0_6px_18px_rgba(17,24,39,0.14)] active:scale-95"
            aria-label={t("home_next_banner")}
          >
            <ChevronRight size={20} strokeWidth={2.5} />
          </button>
        </>
      )}
    </div>
  );
};

export default BannerSwiper;
