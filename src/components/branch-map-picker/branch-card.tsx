"use client";

import { Phone, Store } from "lucide-react";
import { useTranslations } from "next-intl";

import Button from "@/components/ui/button";
import { WEEKDAYS } from "@/constants/weekdays";
import type { BranchProps } from "@/types/branch";
import type { GeneralProps } from "@/types/general";
import { formatTime } from "@/utils/working-time";

type BranchCardProps = {
  branch: BranchProps;
  isActive: boolean;
  workingTime?: GeneralProps["working_time"];
  readOnly: boolean;
  onChoose: () => void;
};

// One swipeable branch card in the map picker's bottom sheet: name,
// address, phone, the whole week's hours and the pick action.
const BranchCard = ({
  branch,
  isActive,
  workingTime,
  readOnly,
  onChoose,
}: BranchCardProps) => {
  const t = useTranslations();

  return (
    <div
      className={`flex flex-col gap-4 rounded-2xl bg-white p-5 ${
        isActive ? "ring-2 ring-green-500" : ""
      }`}
    >
      <div className="flex items-start gap-2">
        <Store
          size={16}
          className="mt-0.5 shrink-0 text-gray220"
        />
        <p className="text-sm font-bold text-black">
          {branch.name}
        </p>
      </div>
      <p className="text-sm font-medium text-gray220">
        {branch.address}
      </p>

      {branch.phone && (
        <a
          href={`tel:${branch.phone}`}
          className="flex items-center gap-2 text-sm font-medium text-black"
        >
          <Phone
            size={14}
            className="shrink-0 text-gray220"
          />
          {branch.phone}
        </a>
      )}

      {/* Always fully expanded — the whole week is shown
          at once, no show-more toggle. */}
      <div className="flex flex-col gap-1.5">
        <p className="text-xs font-bold text-black">
          {t("location_branch_picker_schedule")}
        </p>
        <ul className="flex flex-col gap-1">
          {WEEKDAYS.map((day, index) => {
            const entry = workingTime?.[String(index + 1)];
            const isClosed =
              !entry ||
              entry.is_closed ||
              entry.hours.length === 0;

            return (
              <li
                key={day}
                className="flex items-start justify-between gap-3 text-xs font-medium text-gray220"
              >
                <span className="shrink-0">
                  {t(`weekdays_${index + 1}`)}:
                </span>
                {isClosed ? (
                  <span>—</span>
                ) : (
                  <span className="text-right text-black">
                    {entry.hours.map((hour, hourIndex) => (
                      <span key={hourIndex} className="block">
                        {formatTime(hour.open)} -{" "}
                        {formatTime(hour.close)}
                      </span>
                    ))}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      {!readOnly && (
        <Button
          type="button"
          variant="primary-solid"
          size="primaryWide"
          onClick={onChoose}
        >
          {t("location_branch_picker_pick_here")}
        </Button>
      )}
    </div>
  );
};

export default BranchCard;
