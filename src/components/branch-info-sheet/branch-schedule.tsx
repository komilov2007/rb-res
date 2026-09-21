import { useTranslations } from "next-intl";

import { WEEKDAYS } from "@/constants/weekdays";
import type { GeneralProps } from "@/types/general";
import { formatTime, getDayIndex } from "@/utils/working-time";

type BranchScheduleProps = {
  workingTime?: GeneralProps["working_time"];
};

// The weekly "Ish jadvali" list of BranchInfoSheet, today highlighted.
const BranchSchedule = ({ workingTime }: BranchScheduleProps) => {
  const t = useTranslations();
  const todayIndex = getDayIndex();

  return (
    <div>
      <p className="text-xs font-bold text-black">{t("orders_branch_info_schedule")}</p>
      <ul className="mt-1.5 flex flex-col gap-1">
        {WEEKDAYS.map((day, index) => {
          const dayNumber = index + 1;
          const entry = workingTime?.[String(dayNumber)];
          const isClosed =
            !entry || entry.is_closed || entry.hours.length === 0;
          const isToday = dayNumber === todayIndex;

          return (
            <li
              key={day}
              className={`flex items-start justify-between gap-3 text-xs ${
                isToday
                  ? "font-bold text-primary"
                  : "font-medium text-gray220"
              }`}
            >
              <span className="shrink-0">
                {t(`weekdays_${dayNumber}`)}
                {isToday && ` (${t("common_today")})`}:
              </span>
              {isClosed ? (
                <span>—</span>
              ) : (
                <span
                  className={`text-right ${isToday ? "" : "text-black"}`}
                >
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
