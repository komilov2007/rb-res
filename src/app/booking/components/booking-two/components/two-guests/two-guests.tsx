"use client";

import { Minus, Plus, Users } from "lucide-react";
import { useTranslations } from "next-intl";
import { Controller, useFormContext } from "react-hook-form";

import { getDigits } from "@/utils/format-number";

import { BOOKING_MAX_GUESTS, BOOKING_MIN_GUESTS } from "@/app/booking/constants";
import type { BookingFormValues } from "@/app/booking/schema";
import TwoField from "../two-field";


// Guest count as a tile: the count is the (typeable) value, the stepper
// sits in the tile's trailing slot.
const TwoGuests = () => {
  const t = useTranslations();
  const { control } = useFormContext<BookingFormValues>();

  return (
    <Controller
      control={control}
      name="guests"
      render={({ field }) => (
        <TwoField
          Icon={Users}
          label={t("booking_guests")}
          end={
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                disabled={field.value <= BOOKING_MIN_GUESTS}
                onClick={() =>
                  field.onChange(Math.max(BOOKING_MIN_GUESTS, field.value - 1))
                }
                aria-label={t("booking_guests_decrease")}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-gray10 text-black disabled:opacity-40"
              >
                <Minus size={14} strokeWidth={2.4} />
              </button>
              <button
                type="button"
                disabled={field.value >= BOOKING_MAX_GUESTS}
                onClick={() =>
                  field.onChange(Math.min(BOOKING_MAX_GUESTS, field.value + 1))
                }
                aria-label={t("booking_guests_increase")}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white disabled:opacity-40"
              >
                <Plus size={14} strokeWidth={2.4} />
              </button>
            </div>
          }
        >
          <input
            inputMode="numeric"
            aria-label={t("booking_guests")}
            value={field.value || ""}
            onChange={(event) =>
              field.onChange(Number(getDigits(event.target.value, 3)))
            }
            onBlur={() => {
              if (field.value < BOOKING_MIN_GUESTS) field.onChange(BOOKING_MIN_GUESTS);
              field.onBlur();
            }}
            onFocus={(event) => event.target.select()}
            // text-base (16px) avoids iOS Safari's auto-zoom-on-focus.
            className="w-full bg-transparent text-base font-normal leading-5 text-black outline-none"
          />
        </TwoField>
      )}
    />
  );
};

export default TwoGuests;
