"use client";

import { useState } from "react";
import { CalendarDays } from "lucide-react";
import { IconClockHour3Filled } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { useFormContext, useWatch } from "react-hook-form";

import { useGeneral } from "@/hooks/useGeneral";
import { getDateValue } from "@/utils/format-date";

import type { BookingFormValues } from "@/app/booking/schema";
import { useDayLabel } from "@/app/booking/useDayLabel";
import {
  getBookingDays,
  isDayOff,
  maskDate,
  maskTime,
  parseDisplayDate,
  toDisplayDate,
} from "@/app/booking/utils";
import TileCombo from "../tile-combo";
import TwoField from "../two-field";

// Date + time, checked against general.working_time. The date can be
// typed or picked (the list marks days off, not pickable); the time is
// typed only. The schema flags a day off / a time outside working hours
// in red.
const TwoVisit = () => {
  const t = useTranslations();
  const getDayLabel = useDayLabel();
  const { data: general } = useGeneral();
  const workingTime = general?.data?.working_time;
  const {
    control,
    getValues,
    setValue,
    clearErrors,
    trigger,
    formState: { errors },
  } = useFormContext<BookingFormValues>();
  const selectedDate = useWatch({ control, name: "date" });
  const [days] = useState(getBookingDays);
  // What's in the inputs; the form holds the parsed value.
  const [dateText, setDateText] = useState(() => toDisplayDate(getValues("date")));
  const [timeText, setTimeText] = useState(() => getValues("time"));

  const commitDate = (value: string) => {
    setValue("date", value, { shouldValidate: true, shouldDirty: true });
    // "Is this time within working hours" depends on the day too.
    if (getValues("time")) void trigger("time");
  };

  const handleDateText = (raw: string) => {
    const text = maskDate(raw);

    setDateText(text);

    if (text.length < 10) {
      setValue("date", "");
      clearErrors("date");
      return;
    }

    // A non-existent day ("31.02.2026") is kept as typed so it fails the
    // schema's "valid date" test instead of silently clearing.
    commitDate(parseDisplayDate(text) ?? text);
  };

  const handleTimeText = (raw: string) => {
    const text = maskTime(raw);

    setTimeText(text);

    if (text.length < 5) {
      setValue("time", "");
      clearErrors("time");
      return;
    }

    setValue("time", text, { shouldValidate: true, shouldDirty: true });
  };

  const dateOptions = days.map((day, index) => {
    const value = getDateValue(day);
    const isOff = isDayOff(workingTime, value);

    return {
      value,
      label: getDayLabel(day, index),
      hint: isOff ? t("booking_day_off") : undefined,
      disabled: isOff,
    };
  });

  return (
    <div className="flex flex-col gap-2">
      <TileCombo
        Icon={CalendarDays}
        label={t("booking_date")}
        text={dateText}
        placeholder={t("booking_date_placeholder")}
        maxLength={10}
        onTextChange={handleDateText}
        options={dateOptions}
        selected={selectedDate}
        onSelect={(value) => {
          setDateText(toDisplayDate(value));
          commitDate(value);
        }}
        emptyText={t("booking_select_date")}
        error={errors.date?.message}
      />

      <TwoField Icon={IconClockHour3Filled} label={t("booking_time")} error={errors.time?.message}>
        <input
          value={timeText}
          inputMode="numeric"
          maxLength={5}
          placeholder="00:00"
          aria-label={t("booking_time")}
          onChange={(event) => handleTimeText(event.target.value)}
          // text-base (16px) avoids iOS Safari's auto-zoom-on-focus.
          className="w-full bg-transparent text-base font-normal leading-5 text-black outline-none placeholder:text-gray220/70"
        />
      </TwoField>
    </div>
  );
};

export default TwoVisit;
