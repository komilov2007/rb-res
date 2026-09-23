import { useTranslations } from "next-intl";

import { WEEKDAYS } from "@/constants/weekdays";
import type { GeneralProps } from "@/types/general";
import { formatTime, getDayIndex } from "@/utils/working-time";

type BranchScheduleProps = {
  workingTime?: GeneralProps["working_time"];
  // Omitted -> BranchInfoSheet's own wording, which is what this list showed
  // before it moved out of that folder. Pass null to drop the heading, for a
  // caller that already labels the block itself (the map picker's drawer
  // puts the label on its expand/collapse button).
  title?: string | null;
};

// The weekly "Ish jadvali" list, today highlighted. Shared: BranchInfoSheet
// shows it for one branch, the branch map picker's desktop drawer shows it
// once for the whole shop — working_time is shop-level (see GeneralProps),
// there is no per-branch schedule in the API.
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
          // Day = label, hours = value; today keeps its primary highlight.
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
