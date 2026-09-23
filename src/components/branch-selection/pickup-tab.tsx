"use client";

import { useState } from "react";
import { IconMapPinFilled } from "@tabler/icons-react";
import { useTranslations } from "next-intl";

import { useBranchSelectionStore } from "@/stores/branch-selection";
import type { BranchProps } from "@/types/branch";
import RadioMark from "@/components/ui/radio-mark";

import { getBranchLabel } from "./utils";
import {
  COLLAPSED_COUNT,
  getRowClassName,
  SectionLabel,
  RowText,
  ShowMoreToggle,
  TabProps,
} from "./selection-parts";

type PickupTabProps = TabProps & {
  // Nearest first, computed by BranchSelectionModal (useNearestBranches) so
  // these rows and the map picker show the same branches in the same order.
  branches: BranchProps[];
  // Opens the map picker. Owned by BranchSelectionModal, not here: it closes
  // this modal as it opens, which would unmount a picker rendered from here.
  onOpenMap: () => void;
};

export const PickupTab = ({
  selection,
  branches,
  onOpenMap,
}: PickupTabProps) => {
  const t = useTranslations();
  const setPickup = useBranchSelectionStore((state) => state.setPickup);
  const setSelectionModal = useBranchSelectionStore(
    (state) => state.setSelectionModal,
  );
  const [expanded, setExpanded] = useState(false);
  const visibleBranches = expanded
    ? branches
    : branches.slice(0, COLLAPSED_COUNT);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-3">
        <SectionLabel>
          {t("home_branch_selection_available_branches")}
        </SectionLabel>
        <button
          type="button"
          onClick={onOpenMap}
          className="flex shrink-0 items-center gap-1 text-xs font-medium text-primary"
        >
          <IconMapPinFilled size={14} />
          {t("home_branch_selection_pick_on_map")}
        </button>
      </div>

      {/* Branches still loading: row-sized skeletons instead of the
          "not found" note. */}
      {!selection.isReady &&
        Array.from({ length: COLLAPSED_COUNT }).map((_, index) => (
          <div key={index} className="skeleton h-16 w-full rounded-2xl" />
        ))}

      {selection.isReady && branches.length === 0 && (
        <p className="py-2 text-sm font-normal text-gray220">
          {t("home_branch_selection_branches_not_found")}
        </p>
      )}

      {visibleBranches.map((branch) => {
        const checked =
          selection.serviceType === "PICKUP" &&
          selection.branchId === branch.id;

        return (
          <button
            key={branch.id}
            type="button"
            onClick={() => {
              if (!selection.shopid) return;

              setPickup(selection.shopid, branch.id);
              // A pick is final — close right away.
              setSelectionModal(false);
            }}
            className={getRowClassName(checked)}
          >
            <RowText
              title={getBranchLabel(branch.name)}
              description={branch.address}
            />
            <RadioMark checked={checked} />
          </button>
        );
      })}

      <ShowMoreToggle
        total={branches.length}
        expanded={expanded}
        labelKey="home_branch_selection_show_more_branches"
        onToggle={() => setExpanded((value) => !value)}
      />
    </div>
  );
};
