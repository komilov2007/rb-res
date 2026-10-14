"use client";

import { useState, type ComponentType } from "react";
import { CalendarClock, CalendarDays, Check, ChevronDown } from "lucide-react";
import { IconClockHour3Filled } from "@tabler/icons-react";

import { useTranslations } from "next-intl";
import { useFormContext, useWatch, useFormState } from "react-hook-form";

import {
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/radio-mark";
import { useGeneral } from "@/hooks/useGeneral";
import { getDateValue } from "@/utils/format-date";

import type { BookingFormValues } from "@/app/booking/booking";
import { useDayLabel } from "@/app/booking/utils";
import {
  getBookingDays,
  getBookingTimes,
  isPastSlot,
  maskDate,
  maskTime,
  parseDisplayDate,
  toDisplayDate,
} from "@/app/booking/utils";
import BookingBranch from "../booking-branch";
import { SectionTitle } from "../booking-two";

const triggerClassName = () =>
  "h-12 w-full rounded-xl border border-transparent bg-[#F6F7F9] px-4 text-black data-[placeholder]:text-gray220 [&>span]:flex-1 [&>span]:truncate [&>span]:text-left";

type ComboOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

type VisitComboProps = {
  Icon: ComponentType<{ size?: number; className?: string }>;
  label: string;
  text: string;
  placeholder: string;
  maxLength: number;
  onTextChange: (text: string) => void;
  options: ComboOption[];
  selected: string;
  onSelect: (value: string) => void;
  error?: string;
};

const VisitCombo = ({
  Icon,
  label,
  text,
  placeholder,
  maxLength,
  onTextChange,
  options,
  selected,
  onSelect,
  error,
}: VisitComboProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="min-w-0">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverAnchor asChild>
          <div className="flex h-12 w-full items-center gap-2 rounded-xl border border-transparent bg-[#F6F7F9] pl-4 pr-2 text-black">
            <Icon size={18} className="shrink-0 text-gray220" />
            <input
              value={text}
              inputMode="numeric"
              maxLength={maxLength}
              placeholder={placeholder}
              aria-label={label}
              onChange={(event) => onTextChange(event.target.value)}
              className="min-w-0 flex-1 truncate bg-transparent text-sm text-black outline-none placeholder:text-gray220"
            />
            <PopoverTrigger asChild>
              <button
                type="button"
                aria-label={label}
                className="flex h-8 w-8 shrink-0 items-center justify-center text-gray220"
              >
                <ChevronDown
                  size={16}
                  className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
                />
              </button>
            </PopoverTrigger>
          </div>
        </PopoverAnchor>

        <PopoverContent
          align="start"
          sideOffset={4}
          onOpenAutoFocus={(event) => event.preventDefault()}
          className="max-h-64 w-[var(--radix-popover-trigger-width)] overflow-y-auto p-1"
        >
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              disabled={option.disabled}
              onClick={() => {
                onSelect(option.value);
                setIsOpen(false);
              }}
              className="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-sm text-black hover:bg-gray10 disabled:pointer-events-none disabled:opacity-35"
            >
              <span className="min-w-0 truncate">{option.label}</span>
              {option.value === selected && (
                <Check size={16} className="shrink-0 text-primary" />
              )}
            </button>
          ))}
        </PopoverContent>
      </Popover>
      {error && (
        <span className="mt-1 block px-1 text-xs text-red">{error}</span>
      )}
    </div>
  );
};

const VisitTime = () => {
  const t = useTranslations();
  const getDayLabel = useDayLabel();
  const {
    control,
    getValues,
    setValue,
    clearErrors,
    trigger,
  } = useFormContext<BookingFormValues>();
  const { errors } = useFormState<BookingFormValues>();
  const [days] = useState(getBookingDays);
  const selectedDate = useWatch({ control, name: "date" });
  const selectedTime = useWatch({ control, name: "time" });
  const [dateDraft, setDateDraft] = useState<string | null>(null);
  const [timeDraft, setTimeDraft] = useState<string | null>(null);
  const { data: general } = useGeneral();
  const times = getBookingTimes(general?.data?.working_time, selectedDate);

  const commitDate = (value: string) => {
    setDateDraft(null);
    setValue("date", value, { shouldValidate: true, shouldDirty: true });

    const time = getValues("time");

    if (isPastSlot(value, time)) {
      setTimeDraft(null);
      setValue("time", "", { shouldValidate: true });
    } else if (time) {
      void trigger("time");
    }
  };

  const commitTime = (value: string) => {
    setTimeDraft(null);
    setValue("time", value, { shouldValidate: true, shouldDirty: true });
  };

  const handleDateText = (raw: string) => {
    const text = maskDate(raw);

    if (text.length < 10) {
      setDateDraft(text);
      setValue("date", "");
      clearErrors("date");
      return;
    }

    commitDate(parseDisplayDate(text) ?? text);
  };

  const handleTimeText = (raw: string) => {
    const text = maskTime(raw);

    if (text.length < 5) {
      setTimeDraft(text);
      setValue("time", "");
      clearErrors("time");
      return;
    }

    commitTime(text);
  };

  const dateOptions = days.map((day, index) => ({
    value: getDateValue(day),
    label: getDayLabel(day, index),
  }));

  const timeOptions = times.map((time) => ({
    value: time,
    label: time,
    disabled: isPastSlot(selectedDate, time),
  }));

  return (
    <section className="flex flex-col gap-3 rounded-xl bg-white p-4">
      <SectionTitle
        Icon={CalendarClock}
        title={t("booking_section_visit")}
      />

      <BookingBranch triggerClassName={triggerClassName} />

      <div className="grid grid-cols-2 gap-2">
        <VisitCombo
          Icon={CalendarDays}
          label={t("booking_date")}
          text={dateDraft ?? toDisplayDate(selectedDate)}
          placeholder={t("booking_select_date")}
          maxLength={10}
          onTextChange={handleDateText}
          options={dateOptions}
          selected={selectedDate}
          onSelect={commitDate}
          error={errors.date?.message}
        />

        <VisitCombo
          Icon={IconClockHour3Filled}
          label={t("booking_time")}
          text={timeDraft ?? selectedTime}
          placeholder={t("booking_select_time")}
          maxLength={5}
          onTextChange={handleTimeText}
          options={timeOptions}
          selected={selectedTime}
          onSelect={commitTime}
          error={errors.time?.message}
        />
      </div>
    </section>
  );
};

export default VisitTime;
