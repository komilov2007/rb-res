"use client";
import { getBanners } from "@/apis/banner";
import { BannerSkeleton } from "@/components/ui/skleton";
import { useShopid } from "@/hooks/useShopId";
import { useQuery } from "@tanstack/react-query";
import { Autoplay, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";

const Banner = () => {
  const { shopid, hasShopId } = useShopid();
  const { data, isLoading } = useQuery({
    enabled: hasShopId,
    queryKey: ["banners", shopid],
    queryFn: () => getBanners(shopid as string),
  });
  const banners = data?.data ?? [];
  if (isLoading) return <BannerSkeleton />;
  if (banners.length === 0) return null;

  return (
    <section className="hidden w-full items-center justify-center px-4 pb-4 lg:flex">
      <div className="w-full max-w-7xl">
        <div className="h-[300px] overflow-hidden rounded-xl">
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
            pagination={banners.length > 1}
            modules={[Autoplay, Pagination]}
            className="h-full w-full"
          >
            {banners.map((banner) => (
              <SwiperSlide key={banner.id}>
                <img
                  className="h-full w-full object-cover"
                  src={banner.desktop_photo}
                  alt="Banner"
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
};

export default Banner;
