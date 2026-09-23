"use client";

import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { useFormContext } from "react-hook-form";

import Button from "@/components/ui/button";

import type { BookingFormValues } from "../../schema";
import BookingHeader from "../booking-header";
import BookingHero from "../booking-hero";
import ContactFields from "../contact-fields";
import GuestsComment from "../guests-comment";
import VisitTime from "../visit-time";

// Variant "one": grey page, white app bar, cover photo, then one white
// card per section; fixed white footer with the submit button.
const BookingOne = () => {
  const t = useTranslations();
  const {
    formState: { isSubmitting },
  } = useFormContext<BookingFormValues>();

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-gray10 lg:flex-auto">
      <BookingHeader />

      {/* Mobile: one column of white cards (the panel wrappers are
          display: contents). Desktop: the window scrolls (no inner
          scroller) and, like the order page, two full-bleed white panels
          with an 8px gray gap — sections left (divided by lines instead of
          separate cards), sticky cover + submit right. Each panel pads its
          outer side by max(20px, 50% - 620px) so its content lines up with
          the header's max-w-7xl container. */}
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
