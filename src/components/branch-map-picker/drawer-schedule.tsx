"use client";

import { ChevronDown } from "lucide-react";
import { IconClockFilled } from "@tabler/icons-react";
import { useTranslations } from "next-intl";

import BranchSchedule from "@/components/branch-schedule";
import { RowText } from "@/components/branch-selection/selection-parts";
import { useBoolean } from "@/hooks/useBoolean";
import { formatTime, getDayIndex } from "@/utils/working-time";
import type { GeneralProps } from "@/types/general";

type DrawerScheduleProps = {
  workingTime?: GeneralProps["working_time"];
};

const DrawerSchedule = ({ workingTime }: DrawerScheduleProps) => {
  const t = useTranslations();
  const schedule = useBoolean();

  const todayEntry = workingTime?.[String(getDayIndex())];
  const todayHours =
    !todayEntry || todayEntry.is_closed || todayEntry.hours.length === 0
      ? t("common_closed")
      : todayEntry.hours
          .map((hour) => `${formatTime(hour.open)} - ${formatTime(hour.close)}`)
          .join(", ");

  return (
    <div className="border-b border-gray180 px-4 py-2">
      <button
        type="button"
        onClick={schedule.toggle}
        aria-expanded={schedule.value}
        className="flex w-full items-center gap-3 py-1 text-left"
      >
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gray10 text-gray220">
          <IconClockFilled size={16} />
        </span>
        <RowText
          title={t("location_branch_picker_schedule")}
          description={todayHours}
        />
        <ChevronDown
          size={16}
          className={`shrink-0 text-gray220 transition-transform duration-300 ease-out ${
            schedule.value ? "rotate-180" : ""
          }`}
        />
      </button>

      <div
        className={`grid transition-all duration-300 ease-out ${
          schedule.value
            ? "grid-rows-[1fr] opacity-100"
            : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="mb-1 mt-2 pl-11">
            <BranchSchedule workingTime={workingTime} title={null} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DrawerSchedule;
