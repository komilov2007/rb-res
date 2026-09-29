"use client";

import { useTranslations } from "next-intl";
import { Controller, useFormContext } from "react-hook-form";

import type { BookingFormValues } from "@/app/booking/schema";

// Optional comment: same bordered tile look; the card title labels it.
const TwoComment = () => {
  const t = useTranslations();
  const { control } = useFormContext<BookingFormValues>();

  return (
    <div className="rounded-xl border border-gray180/60 bg-white px-3 py-2.5 transition-colors focus-within:border-primary">
      <Controller
        control={control}
        name="comment"
        render={({ field }) => (
          <textarea
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
            rows={2}
            placeholder={t("booking_comment_placeholder")}
            // text-base (16px) avoids iOS Safari's auto-zoom-on-focus.
            aria-label={t("booking_leave_comment")}
            className="w-full resize-none bg-transparent text-base text-black outline-none placeholder:text-gray220"
          />
        )}
      />
    </div>
  );
};

export default TwoComment;
