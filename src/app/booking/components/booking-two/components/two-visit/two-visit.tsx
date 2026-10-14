"use client";

import { useState } from "react";
import { CalendarDays, MapPin } from "lucide-react";
import { IconClockHour3Filled } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { useFormContext, useWatch, useFormState } from "react-hook-form";

import { useGeneral } from "@/hooks/useGeneral";
import { getDateValue } from "@/utils/format-date";

import type { BookingFormValues } from "@/app/booking/booking";
import { useDayLabel } from "@/app/booking/utils";
import { getBookingDays, isDayOff, maskDate, maskTime, parseDisplayDate, toDisplayDate } from "@/app/booking/utils";
import BookingBranch from "../../../booking-branch";
import TileCombo from "../tile-combo";
import { TwoField } from "../two-footer";

const branchTriggerClassName = () =>
  "h-5 w-full rounded-none bg-transparent px-0 text-base font-normal leading-5 text-black data-[placeholder]:text-gray220/70 [&>span]:flex-1 [&>span]:truncate [&>span]:text-left";

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
  } = useFormContext<BookingFormValues>();
  const { errors } = useFormState<BookingFormValues>();
  const selectedDate = useWatch({ control, name: "date" });
  const [days] = useState(getBookingDays);
  const [dateText, setDateText] = useState(() => toDisplayDate(getValues("date")));
  const [timeText, setTimeText] = useState(() => getValues("time"));

  const commitDate = (value: string) => {
    setValue("date", value, { shouldValidate: true, shouldDirty: true });
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
      <TwoField Icon={MapPin} label={t("common_branch")} error={errors.branch?.message}>
        <BookingBranch
          triggerClassName={branchTriggerClassName}
          showIcon={false}
          showError={false}
        />
      </TwoField>

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
          className="w-full bg-transparent text-base font-normal leading-5 text-black outline-none placeholder:text-gray220/70"
        />
      </TwoField>
    </div>
  );
};

export default TwoVisit;
