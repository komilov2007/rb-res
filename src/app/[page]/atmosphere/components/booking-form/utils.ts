import { type FormEvent } from "react";

import { getDigits } from "@/utils/format-number";
import { translate } from "@/utils/translate";

export const getDateValue = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export const getLocalDate = (value: string) => {
  const [year, month, day] = value.split("-").map(Number);

  return new Date(year, month - 1, day);
};

export const getWeekDays = (locale: string) => {
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(2026, 0, 5 + index);

    return date.toLocaleDateString(locale, { weekday: "short" });
  });
};

export const formatSelectedDate = (value: string, locale: string) => {
  if (!value) return translate("booking.select_date");

  const date = getLocalDate(value);

  return date.toLocaleDateString(locale, {
    day: "2-digit",
    month: "short",
    weekday: "short",
  });
};

export const getMonthDays = (date: Date) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const days: (Date | null)[] = Array.from({ length: startOffset }, () => null);

  for (let day = 1; day <= lastDay.getDate(); day++) {
    days.push(new Date(year, month, day));
  }

  return days;
};

export const handlePhoneInput = (event: FormEvent<HTMLInputElement>) => {
  event.currentTarget.value = getDigits(event.currentTarget.value, 9);
};
