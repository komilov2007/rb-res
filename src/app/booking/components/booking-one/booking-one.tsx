"use client";

import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { useFormContext } from "react-hook-form";
import Button from "@/components/ui/button";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import type { BookingFormValues } from "@/app/booking/booking";
import BookingDesktop from "../booking-desktop";
import { BookingHeader } from "../booking-desktop";
import { BookingHeroBookingHero as BookingHero } from "./booking-one";
import ContactFields from "../contact-fields";
import GuestsComment from "../guests-comment";
import VisitTime from "../visit-time";
import { ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations as useTranslationsBookingHero } from "next-intl";
import { ROUTER } from "@/constants/router";
import { useShopId } from "@/hooks/useShopId";
import { galleryImages } from "@/constants/atmosphere";

const BookingOne = () => {
  const t = useTranslations();
  const {
    formState: { isSubmitting },
  } = useFormContext<BookingFormValues>();
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  if (isDesktop) return <BookingDesktop />;

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-gray10 lg:flex-auto">
      <BookingHeader />

      <div className="scroll-hidden min-h-0 flex-1 overflow-y-auto lg:flex lg:flex-auto lg:flex-col lg:overflow-visible">
        <div className="mx-auto flex w-full max-w-xl flex-col gap-2 px-4 py-2 lg:max-w-none lg:flex-1 lg:flex-row lg:px-0">
          <div className="contents lg:order-last lg:block lg:w-[calc(max(20px,50%-620px)+420px)] lg:shrink-0 lg:rounded-l-[30px] lg:bg-white lg:pl-6 lg:pr-[max(20px,calc(50%-620px))]">
            <aside className="lg:sticky lg:top-2 lg:flex lg:flex-col lg:gap-3 lg:py-5">
              <BookingHero />
              <Button
                type="submit"
                variant="primary-solid"
                size="primaryWide"
                disabled={isSubmitting}
                className="hidden h-12 w-full rounded-xl text-base lg:flex"
              >
                {t("booking_submit")}
                <ArrowRight size={18} />
              </Button>
            </aside>
          </div>
          <div className="contents lg:flex lg:min-w-0 lg:flex-1 lg:flex-col lg:rounded-r-[30px] lg:bg-white lg:py-2 lg:pl-[max(20px,calc(50%-620px))] lg:pr-6 lg:[&_section]:rounded-none lg:[&_section]:border-b lg:[&_section]:border-gray180 lg:[&_section]:px-0 lg:[&_section]:py-5 lg:[&_section:last-of-type]:border-b-0">
            <ContactFields />
            <VisitTime />
            <GuestsComment />
          </div>
        </div>
      </div>

      <div className="shrink-0 border-t border-gray180 bg-white pb-[max(16px,env(safe-area-inset-bottom))] pt-3 lg:hidden">
        <div className="mx-auto w-full max-w-xl px-4">
          <Button
            type="submit"
            variant="primary-solid"
            size="primaryWide"
            disabled={isSubmitting}
            className="h-12 w-full rounded-xl text-base"
          >
            {t("booking_submit")}
            <ArrowRight size={18} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BookingOne;

const BookingHeroBookingHero = () => {
  const t = useTranslationsBookingHero();
  const router = useRouter();
  const { shopid } = useShopId();

  return (
    <button
      type="button"
      onClick={() =>
        router.push(`${ROUTER.ATMOSPHERE}${shopid ? `?shop_id=${shopid}` : ""}`)
      }
      className="relative block h-56 w-full overflow-hidden rounded-xl bg-black text-left lg:h-80"
    >
      <img
        src={galleryImages[0].src}
        alt=""
        className="h-full w-full object-cover opacity-90"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/5" />
      <span className="absolute right-3 top-3 flex items-center gap-0.5 rounded-full bg-white/20 py-1 pl-3 pr-2 text-xs font-medium text-white backdrop-blur-md">
        {t("atmosphere_title")}
        <ChevronRight size={14} />
      </span>
      <div className="absolute inset-x-4 bottom-4 text-white">
        <span className="mb-2 block h-1 w-8 rounded-full bg-white" />
        <h2 className="text-lg font-medium leading-6">
          {t("booking_form_title")}
        </h2>
      </div>
    </button>
  );
};

export { BookingHeroBookingHero };
