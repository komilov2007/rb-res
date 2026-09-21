"use client";

import { useTranslations } from "next-intl";

// "Dushanba, 22.09" — weekday names come from the app's own translations
// (Intl has no Uzbek names in most browsers and falls back to English).
// index 0 (the first of getBookingDays) reads "Bugun".
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
