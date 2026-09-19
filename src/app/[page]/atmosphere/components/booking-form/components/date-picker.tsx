import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { DATE_LOCALES } from "../constants";
import {
  formatSelectedDate,
  getDateValue,
  getMonthDays,
  getWeekDays,
} from "../utils";

type DatePickerProps = {
  value: string;
  month: Date;
  onChange: (value: string) => void;
  onChangeMonth: (value: Date) => void;
};

const DatePicker = ({
  value,
  month,
  onChange,
  onChangeMonth,
}: DatePickerProps) => {
  const t = useTranslations();
  const dateLocale = DATE_LOCALES[useLocale()] ?? DATE_LOCALES.uz;
  const days = getMonthDays(month);
  const weekDays = getWeekDays(dateLocale);
  const monthLabel = month.toLocaleDateString(dateLocale, {
    month: "long",
    year: "numeric",
  });

  const handleChangeMonth = (direction: "prev" | "next") => {
    onChangeMonth(
      new Date(
        month.getFullYear(),
        month.getMonth() + (direction === "prev" ? -1 : 1),
        1,
      ),
    );
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex h-13 w-full items-center gap-3 rounded-xl border border-gray180 bg-gray10 px-5 text-left outline-none transition-colors focus:border-black"
        >
          <CalendarDays size={20} className="shrink-0 text-gray220" />
          <span
            className={`text-sm font-normal ${
              value ? "text-black" : "text-gray220"
            }`}
          >
            {value
              ? formatSelectedDate(value, dateLocale)
              : t("booking.select_date")}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[282px] rounded-xl p-4">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-base font-bold text-gray220">
            {monthLabel}
          </h3>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleChangeMonth("prev")}
              className="grid h-8 w-8 place-items-center rounded-full text-black hover:bg-gray10"
            >
              <ChevronLeft size={19} />
            </button>
            <button
              type="button"
              onClick={() => handleChangeMonth("next")}
              className="grid h-8 w-8 place-items-center rounded-full text-black hover:bg-gray10"
            >
              <ChevronRight size={19} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-y-3">
          {weekDays.map((day) => (
            <span
              key={day}
              className="text-center text-xs font-medium text-black"
            >
              {day}
            </span>
          ))}

          {days.map((day, index) => {
            if (!day) return <span key={`empty-${index}`} />;

            const dateValue = getDateValue(day);
            const isActive = value === dateValue;
            const isToday = dateValue === getDateValue(new Date());

            return (
              <button
                key={dateValue}
                type="button"
                onClick={() => onChange(dateValue)}
                className={`mx-auto grid h-8 w-8 place-items-center rounded-full text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary text-white"
                    : isToday
                      ? "border-2 border-black bg-gray10 text-black"
                      : "text-gray220 hover:bg-gray10 hover:text-black"
                }`}
              >
                {day.getDate()}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default DatePicker;
