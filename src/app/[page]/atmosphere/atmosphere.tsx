"use client";

import { useBanner } from "@/app/[page]/components/banner/useBanner";
import PageLayout from "@/app/[page]/components/page-layout";
import { BannerSkeleton } from "@/components/ui/skleton";
import BookingBg from "@/icons/booking.avif";

import AtmosphereGallery from "./components/atmosphere-gallery";
import BookingForm from "./components/booking-form";

const bookingBgSrc = typeof BookingBg === "string" ? BookingBg : BookingBg.src;

const Atmosphere = () => {
  const { banners, isLoading } = useBanner();
  const images = banners
    .map((banner) => banner.desktop_photo || banner.mobile_photo)
    .filter(Boolean);

  return (
    <PageLayout>
      <div className="space-y-3">
        <section className="w-full rounded-b-[30px] bg-white px-4 py-5 lg:px-6 lg:py-8">
          <div className="mx-auto w-full max-w-275">
            <div>
              <h2 className="text-lg font-extrabold leading-tight text-black lg:text-2xl">
                Atmosfera
              </h2>
              <p className="mt-1 max-w-130 text-xs font-semibold leading-5 text-gray220 lg:text-sm">
                Bizning muhitimizdan lavhalar - siz uchun eng yaxshi dam olish
                joyi.
              </p>
            </div>

            {isLoading ? (
              <div className="mt-5">
                <BannerSkeleton />
              </div>
            ) : (
              <AtmosphereGallery images={images} />
            )}
          </div>
        </section>

        <section
          className="relative w-full overflow-hidden rounded-[30px] bg-black bg-cover bg-center px-4 py-5 lg:px-6 lg:py-8"
          style={{
            backgroundImage: `url(${bookingBgSrc})`,
          }}
        >
          <div className="absolute inset-0 bg-black/70" />
          <div className="relative mx-auto w-full max-w-[1100px]">
            <BookingForm />
          </div>
        </section>
      </div>
    </PageLayout>
  );
};

export default Atmosphere;
