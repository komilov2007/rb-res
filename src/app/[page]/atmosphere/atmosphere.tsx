"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import PageLayout from "@/app/[page]/components/page-layout";
import Button from "@/components/ui/button";
import { useShopid } from "@/hooks/useShopId";

import AtmosphereGallery from "./components/atmosphere-gallery";
import BookingForm from "./components/booking-form";

const Atmosphere = () => {
  const t = useTranslations();
  const router = useRouter();
  const { shopid } = useShopid();

  const handleBackHome = () => {
    router.push(`/${shopid ? `?shop_id=${shopid}` : ""}`);
  };

  return (
    <PageLayout>
      <div className="space-y-3">
        <section className="w-full rounded-b-[30px] bg-white px-4 py-5 lg:px-6 lg:py-4">
          <div className="mx-auto w-full max-w-6xl">
            <Button
              type="button"
              variant="plain"
              size="none"
              onClick={handleBackHome}
              className=" gap-2 text-sm font-medium text-black"
            >
              <ArrowLeft size={18} />
              {t("booking_back_home")}
            </Button>
            <AtmosphereGallery />
          </div>
        </section>

        <section className="w-full rounded-[30px] bg-white px-4 py-5 lg:px-6 lg:py-8">
          <div className="mx-auto w-full max-w-6xl">
            <BookingForm />
          </div>
        </section>
      </div>
    </PageLayout>
  );
};

export default Atmosphere;
