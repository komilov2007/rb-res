import type { BannerProps } from "@/types/banner";
import { Autoplay, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

type BannerSwiperProps = {
  banners: BannerProps[];
  variant: "mobile" | "desktop";
};

const BannerSwiper = ({ banners, variant }: BannerSwiperProps) => {
  const isDesktop = variant === "desktop";

  return (
    <Swiper
      loop={banners.length > 1}
      autoplay={
        banners.length > 1
          ? {
              delay: 3000,
              disableOnInteraction: false,
            }
          : false
      }
      pagination={isDesktop && banners.length > 1}
      modules={isDesktop ? [Autoplay, Pagination] : [Autoplay]}
      className="h-full w-full"
    >
      {banners.map((banner) => (
        <SwiperSlide key={banner.id}>
          {isDesktop ? (
            <picture className="block h-full w-full">
              <source
                media="(min-width: 1024px)"
                srcSet={banner.desktop_photo}
              />
              <img
                className="h-full w-full object-cover"
                src={banner.mobile_photo || banner.desktop_photo}
                alt="Banner"
              />
            </picture>
          ) : (
            <img
              className="h-full w-full object-cover opacity-90"
              src={banner.mobile_photo || banner.desktop_photo}
              alt="Banner"
            />
          )}
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default BannerSwiper;
