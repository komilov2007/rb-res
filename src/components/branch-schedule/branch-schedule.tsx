import { useTranslations } from "next-intl";

import { WEEKDAYS } from "@/constants/weekdays";
import type { GeneralProps } from "@/types/general";
import { formatTime, getDayIndex } from "@/utils/working-time";

type BranchScheduleProps = {
  workingTime?: GeneralProps["working_time"];
  title?: string | null;
};

const BranchSchedule = ({ workingTime, title }: BranchScheduleProps) => {
  const t = useTranslations();
  const todayIndex = getDayIndex();
  const heading =
    title === undefined ? t("orders_branch_info_schedule") : title;

  return (
    <div>
      {heading && (
        <p className="text-xs font-medium text-black">{heading}</p>
      )}
      <ul className="mt-1.5 flex flex-col gap-1">
        {WEEKDAYS.map((day, index) => {
          const dayNumber = index + 1;
          const entry = workingTime?.[String(dayNumber)];
          const isClosed =
            !entry || entry.is_closed || entry.hours.length === 0;
          const isToday = dayNumber === todayIndex;
          const valueClassName = `text-[13px] font-medium ${
            isToday ? "text-primary" : "text-gray220/70"
          }`;

          return (
            <li
              key={day}
              className="flex items-start justify-between gap-3"
            >
              <span
                className={`shrink-0 ${
                  isToday ? "text-sm font-normal text-primary" : "info-label"
                }`}
              >
                {t(`weekdays_${dayNumber}`)}
                {isToday && ` (${t("common_today")})`}:
              </span>
              {isClosed ? (
                <span className={valueClassName}>—</span>
              ) : (
                <span className={`text-right ${valueClassName}`}>
                  {entry.hours.map((hour, hourIndex) => (
                    <span key={hourIndex} className="block">
                      {formatTime(hour.open)} - {formatTime(hour.close)}
                    </span>
                  ))}
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default BranchSchedule;
