"use client";

import { useState } from "react";
import { CalendarClock, CalendarDays } from "lucide-react";
import { IconClockHour3Filled } from "@tabler/icons-react";

import { useTranslations } from "next-intl";
import { Controller, useFormContext, useWatch } from "react-hook-form";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BOOKING_TIMES } from "@/constants/booking";
import { getDateValue } from "@/utils/format-date";

import type { BookingFormValues } from "../../schema";
import { useDayLabel } from "../../useDayLabel";
import { getBookingDays, isPastSlot } from "../../utils";
import SectionTitle from "../section-title";

const triggerClassName = (hasError: boolean) =>
  `h-12 w-full rounded-xl border bg-[#F6F7F9] px-4 text-black data-[placeholder]:text-gray220 [&>span]:flex-1 [&>span]:truncate [&>span]:text-left ${
    hasError ? "border-red" : "border-transparent"
  }`;

const contentClassName =
  "max-h-64 w-[var(--radix-select-trigger-width)] rounded-xl";

const VisitTime = () => {
  const t = useTranslations();
  const getDayLabel = useDayLabel();
  const {
    control,
    getValues,
    setValue,
    trigger,
    formState: { errors },
  } = useFormContext<BookingFormValues>();
  const [days] = useState(getBookingDays);
  // useWatch (not getValues) so the time list re-renders on a date change.
  const selectedDate = useWatch({ control, name: "date" });

  return (
    <section className="flex flex-col gap-3 rounded-xl bg-white p-4">
      <SectionTitle
        Icon={CalendarClock}
        title={t("booking_section_visit")}
      />

      <div className="grid grid-cols-2 gap-2">
        <Controller
          control={control}
          name="date"
          render={({ field }) => (
            <div className="min-w-0">
              <Select
                value={field.value}
                onValueChange={(value) => {
                  field.onChange(value);
                  const time = getValues("time");

                  // A slot that's fine on another day may already be over
                  // today — drop it rather than keep a past time.
                  if (isPastSlot(value, time)) {
                    setValue("time", "", { shouldValidate: true });
                  } else if (time) {
                    // "Within working hours" depends on the day too.
                    void trigger("time");
                  }
                }}
              >
                <SelectTrigger
                  aria-label={t("booking_date")}
                  className={triggerClassName(Boolean(errors.date))}
                >
                  <CalendarDays size={18} className="shrink-0 text-gray220" />
                  <SelectValue placeholder={t("booking_select_date")} />
                </SelectTrigger>
                <SelectContent className={contentClassName}>
                  {days.map((day, index) => (
                    <SelectItem key={day.getTime()} value={getDateValue(day)}>
                      {getDayLabel(day, index)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.date && (
                <span className="mt-1 block px-1 text-xs text-red">
                  {errors.date.message}
                </span>
              )}
            </div>
          )}
        />

        <Controller
          control={control}
          name="time"
          render={({ field }) => (
            <div className="min-w-0">
              {/* "" (not undefined) shows the placeholder: undefined makes
                  Radix uncontrolled and it keeps showing the last picked
                  slot after the time is cleared. */}
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger
                  aria-label={t("booking_time")}
                  className={triggerClassName(Boolean(errors.time))}
                >
                  <IconClockHour3Filled size={18} className="shrink-0 text-gray220" />
                  <SelectValue placeholder={t("booking_select_time")} />
                </SelectTrigger>
                <SelectContent className={contentClassName}>
                  {BOOKING_TIMES.map((time) => (
                    <SelectItem
                      key={time}
                      value={time}
                      disabled={isPastSlot(selectedDate, time)}
                      className="data-[disabled]:pointer-events-none data-[disabled]:opacity-35"
                    >
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.time && (
                <span className="mt-1 block px-1 text-xs text-red">
                  {errors.time.message}
                </span>
              )}
            </div>
          )}
        />
      </div>
    </section>
  );
};

export default VisitTime;
