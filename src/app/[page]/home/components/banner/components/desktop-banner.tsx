import type { BannerProps } from "@/types/banner";
import BannerSwiper from "./banner-swiper";

type DesktopBannerProps = {
  banners: BannerProps[];
};

const DesktopBanner = ({ banners }: DesktopBannerProps) => {
  return (
    <section className="hidden w-full items-center justify-center px-4 pb-4 lg:flex">
      <div className="w-full max-w-7xl">
        <div className="h-[150px] overflow-hidden rounded-xl sm:h-[190px] lg:h-[300px]">
          <BannerSwiper banners={banners} variant="desktop" />
        </div>
      </div>
    </section>
  );
};

export default DesktopBanner;
