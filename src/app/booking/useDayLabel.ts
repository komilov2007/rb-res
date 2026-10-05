"use client";

import { useTranslations } from "next-intl";

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
