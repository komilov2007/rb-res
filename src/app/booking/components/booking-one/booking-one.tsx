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
    <div className="flex min-h-0 flex-1 flex-col bg-gray10">
      <BookingHeader />

      <div className="scroll-hidden min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto flex w-full max-w-xl flex-col gap-2 px-4 py-3">
          <BookingHero />
          <ContactFields />
          <VisitTime />
          <GuestsComment />
        </div>
      </div>

      <div className="shrink-0 border-t border-gray180 bg-white pb-[max(16px,env(safe-area-inset-bottom))] pt-3">
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
