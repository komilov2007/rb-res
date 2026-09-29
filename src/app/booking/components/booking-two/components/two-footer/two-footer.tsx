"use client";

import { ArrowRight, CalendarDays, Users } from "lucide-react";
import { IconClockHour3Filled } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { useFormContext, useWatch } from "react-hook-form";

import Button from "@/components/ui/button";

import type { BookingFormValues } from "@/app/booking/schema";

// "2026-09-22" -> "22.09"
const toShortDate = (value: string) =>
  value ? value.split("-").reverse().slice(0, 2).join(".") : "—";

// Live summary of the picks ("22.09 · 19:00 · 2") above the submit button.
type TwoFooterProps = {
  className?: string;
};

// Mobile: pinned under the scroller. Desktop: part of the sticky right
// panel, under the photo (booking-two renders one instance per layout).
const TwoFooter = ({ className = "" }: TwoFooterProps) => {
  const t = useTranslations();
  const {
    control,
    formState: { isSubmitting },
  } = useFormContext<BookingFormValues>();
  const [date, time, guests] = useWatch({
    control,
    name: ["date", "time", "guests"],
  });

  return (
    <div
      className={`shrink-0 bg-white px-4 pb-[max(16px,env(safe-area-inset-bottom))] pt-3 lg:p-0 ${className}`}
    >
      <div className="mx-auto w-full max-w-xl">
        <div className="mb-3 flex items-center justify-center gap-4 text-sm font-normal text-black">
          <span className="flex items-center gap-1.5">
            <CalendarDays size={16} className="text-gray220" />
            {toShortDate(date)}
          </span>
          <span className="flex items-center gap-1.5">
            <IconClockHour3Filled size={16} className="text-gray220" />
            {time || "—"}
          </span>
          <span className="flex items-center gap-1.5">
            <Users size={16} className="text-gray220" />
            {guests || "—"}
          </span>
        </div>
        <Button
          type="submit"
          variant="primary-solid"
          size="primaryWide"
          disabled={isSubmitting}
          className="h-13 w-full rounded-xl text-base"
        >
          {t("booking_submit")}
          <ArrowRight size={18} />
        </Button>
      </div>
    </div>
  );
};

export default TwoFooter;
