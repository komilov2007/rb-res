import Language from "@/components/language";
import { Clock3, Truck } from "lucide-react";
import type { useTranslations } from "next-intl";
import type { BannerProps } from "@/types/banner";
import BannerInfoCard from "./banner-info-card";
import BannerLocationCard from "./banner-location-card";
import BannerSwiper from "./banner-swiper";

type MobileBannerProps = {
  t: ReturnType<typeof useTranslations>;
  banners: BannerProps[];
  shopName: string;
  todayWorkTime: string;
  servicesTitle: string;
  servicesText: string;
};

const MobileBanner = ({
  t,
  banners,
  shopName,
  todayWorkTime,
  servicesTitle,
  servicesText,
}: MobileBannerProps) => {
  return (
    <section className="lg:hidden">
      <div className="relative h-[238px] overflow-hidden bg-black">
        <BannerSwiper banners={banners} variant="mobile" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/10 to-black/45" />

        <div className="absolute left-0 top-0 z-10 grid w-full grid-cols-[90px_1fr_90px] items-center px-4 pt-10 text-white">
          <div className="flex justify-start">
            <Language variant="hero" />
          </div>

          <div className="text-center">
            <h2 className="font-serif text-xl font-bold italic leading-5">
              {shopName}
            </h2>
            <p className="text-[8px] font-bold uppercase tracking-[0.18em] text-yellow">
              Restaurant
            </p>
          </div>

          <div />
        </div>
      </div>

      <div className="-mt-8 px-3">
        <div className="relative z-20 rounded-[18px] bg-white px-4 pb-3 pt-3 shadow-[0_4px_16px_var(--black40)]">
          <h1 className="text-[24px] font-extrabold leading-7 text-black">
            {shopName}
          </h1>

          <div className="mt-3 grid grid-cols-2 divide-x divide-gray180">
            <BannerInfoCard
              icon={<Clock3 size={14} />}
              label={todayWorkTime}
              value={t("work_time")}
            />
            <BannerInfoCard
              icon={<Truck size={14} />}
              label={servicesTitle}
              value={servicesText || t("service_type")}
            />
          </div>
        </div>

        <BannerLocationCard t={t} />
      </div>
    </section>
  );
};

export default MobileBanner;
