"use client";

import { MessageSquareText, Minus, Plus, Users } from "lucide-react";
import { useTranslations } from "next-intl";
import { Controller, useFormContext } from "react-hook-form";

import Button from "@/components/ui/button";
import { getDigits } from "@/utils/format-number";

import type { BookingFormValues } from "../../schema";
import SectionTitle from "../section-title";

const MIN_GUESTS = 1;
const MAX_GUESTS = 999;

const GuestsComment = () => {
  const t = useTranslations();
  const { control } = useFormContext<BookingFormValues>();

  return (
    <section className="flex flex-col gap-4 rounded-xl bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <SectionTitle
          Icon={Users}
          title={t("booking_guests")}
        />

        {/* Same pill counter as the cart's (cart-counter / cart-plus), in
            black, with a typeable count in the middle. */}
        <Controller
          control={control}
          name="guests"
          render={({ field }) => (
            <Button asChild variant="cart-counter" size="cartCounterMobile">
              <div className="shrink-0">
                <Button
                  type="button"
                  variant="cart-plus"
                  size="cartActionMobile"
                  disabled={field.value <= MIN_GUESTS}
                  onClick={() =>
                    field.onChange(Math.max(MIN_GUESTS, field.value - 1))
                  }
                  className="!text-black hover:!bg-gray180"
                >
                  <Minus size={14} strokeWidth={2.2} />
                </Button>
                <input
                  inputMode="numeric"
                  aria-label={t("booking_guests")}
                  // Empty while typing is allowed (0 in the form); blur puts
                  // it back to the minimum.
                  value={field.value || ""}
                  onChange={(event) =>
                    field.onChange(Number(getDigits(event.target.value, 3)))
                  }
                  onBlur={() => {
                    if (field.value < MIN_GUESTS) field.onChange(MIN_GUESTS);
                    field.onBlur();
                  }}
                  onFocus={(event) => event.target.select()}
                  // text-base (16px) avoids iOS Safari's auto-zoom-on-focus.
                  className="w-10 bg-transparent text-center text-base font-medium text-black outline-none"
                />
                <Button
                  type="button"
                  variant="cart-plus"
                  size="cartActionMobile"
                  disabled={field.value >= MAX_GUESTS}
                  onClick={() =>
                    field.onChange(Math.min(MAX_GUESTS, field.value + 1))
                  }
                  className="!text-black hover:!bg-gray180"
                >
                  <Plus size={14} strokeWidth={2.2} />
                </Button>
              </div>
            </Button>
          )}
        />
      </div>

      <hr className="border-gray180" />

      <div className="flex flex-col gap-3">
        <SectionTitle
          Icon={MessageSquareText}
          title={t("booking_leave_comment")}
        />
        <Controller
          control={control}
          name="comment"
          render={({ field }) => (
            <textarea
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              rows={3}
              placeholder={t("booking_comment_placeholder")}
              // text-base (16px) avoids iOS Safari's auto-zoom-on-focus.
              className="w-full resize-none rounded-xl border border-transparent bg-[#F6F7F9] px-4 py-3 text-base font-normal text-black outline-none transition-colors placeholder:text-gray220 hover:border-gray180 focus:border-orange-200 focus:bg-white"
            />
          )}
        />
      </div>
    </section>
  );
};

export default GuestsComment;
