"use client";

import { getDateValue } from "@/utils/format-date";
import type { GeneralProps } from "@/types/general";
import { formatTime, getDayIndex } from "@/utils/working-time";
import { useTranslations } from "next-intl";
import { useForm, type SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useGeneral } from "@/hooks/useGeneral";
import { useAuthStore } from "@/stores/auth";
import { getLocalPhone } from "@/utils/format-number";
import { bookingSchema, type BookingFormValues, type BookingSchemaContext } from "./booking";

export type WorkingTime = GeneralProps["working_time"];

export const BOOKING_DAYS_AHEAD = 14;

export const getBookingDays = () =>
  Array.from({ length: BOOKING_DAYS_AHEAD }, (_, index) => {
    const date = new Date();

    date.setDate(date.getDate() + index);

    return date;
  });

export const isToday = (date: string) => date === getDateValue(new Date());

const toMinutes = (time: string) => {
  const [hours, minutes] = formatTime(time).split(":").map(Number);

  return hours * 60 + minutes;
};

export const isPastSlot = (date: string, time: string) => {
  if (!date || !time || !isToday(date)) return false;

  const now = new Date();

  return toMinutes(time) <= now.getHours() * 60 + now.getMinutes();
};

export const isIsoDate = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value);

export const isTime = (value: string) =>
  /^([01]\d|2[0-3]):[0-5]\d$/.test(value);

export const maskDate = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 8);

  return [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4, 8)]
    .filter(Boolean)
    .join(".");
};

export const maskTime = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 4);

  return digits.length > 2 ? `${digits.slice(0, 2)}:${digits.slice(2)}` : digits;
};

export const parseDisplayDate = (value: string) => {
  const match = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(value);

  if (!match) return null;

  const [, day, month, year] = match.map(Number);
  const date = new Date(year, month - 1, day);

  if (date.getMonth() !== month - 1 || date.getDate() !== day) return null;

  return getDateValue(date);
};

export const toDisplayDate = (value: string) =>
  isIsoDate(value) ? value.split("-").reverse().join(".") : value;

const getDaySchedule = (workingTime: WorkingTime, date: string) => {
  if (!workingTime || !isIsoDate(date)) return null;

  const [year, month, day] = date.split("-").map(Number);

  return workingTime[String(getDayIndex(new Date(year, month - 1, day)))] ?? null;
};

export const isDayOff = (workingTime: WorkingTime, date: string) => {
  const schedule = getDaySchedule(workingTime, date);

  return Boolean(
    schedule && (schedule.is_closed || schedule.hours.length === 0),
  );
};

const getWindows = (workingTime: WorkingTime, date: string) => {
  const schedule = getDaySchedule(workingTime, date);

  if (!schedule || schedule.is_closed) return null;

  return schedule.hours.map(({ open, close }) => {
    const start = toMinutes(open);
    const end = toMinutes(close);

    return { start, end: end > start ? end : 24 * 60 };
  });
};

export const isWithinWorkingHours = (
  workingTime: WorkingTime,
  date: string,
  time: string,
) => {
  const windows = getWindows(workingTime, date);

  if (!windows) return !isDayOff(workingTime, date);

  const minutes = toMinutes(time);

  return windows.some(({ start, end }) => minutes >= start && minutes < end);
};

export const useDayLabel = () => {
  const t = useTranslations();

  return (day: Date, index: number) => {
    const weekday =
      index === 0
        ? t("common_today").replace(/^./, (char) => char.toUpperCase())
        : t(`weekdays_${((day.getDay() + 6) % 7) + 1}`);
    const date = `${String(day.getDate()).padStart(2, "0")}.${String(
      day.getMonth() + 1,
    ).padStart(2, "0")}`;

    return `${weekday}, ${date}`;
  };
};

export const usePage = () => {
  const auth = useAuthStore((state) => state.auth);
  const { data: general } = useGeneral();

  const form = useForm<BookingFormValues, BookingSchemaContext>({
    mode: "onChange",
    resolver: yupResolver(bookingSchema),
    context: { workingTime: general?.data?.working_time },
    defaultValues: bookingSchema.cast(
      {
        name: auth?.firstname ?? "",
        phone: getLocalPhone(auth?.phone),
      },
      { assert: false },
    ),
  });

  const onSubmit: SubmitHandler<BookingFormValues> = () => {};

  return { form, onSubmit };
};
