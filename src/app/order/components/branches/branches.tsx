"use client";

import { ChevronRight } from "lucide-react";
import { IconMapPinFilled } from "@tabler/icons-react";
import { useTranslations } from "next-intl";

import BranchInfoSheet from "@/components/branch-info-sheet";
import Button from "@/components/ui/button";
import type { BranchProps } from "@/types/branch";
import type { GeneralProps } from "@/types/general";
import { getShortAddress } from "@/utils/address";

import BranchPickerSheet from "./branch-picker-sheet";
import { useBranches } from "./useBranches";

type BranchesProps = {
  branches?: BranchProps[];
  isLoading: boolean;
  isError: boolean;
  workingTime?: GeneralProps["working_time"];
  value: number | null;
  error?: string;
};

// Pickup branch field. The branch still defaults to whatever the home page
// selected (usePage.ts mirrors it into the form), but it is no longer
// read-only here: "Filialni o'zgartirish" opens a picker that checks every
// branch against the current cart, so a branch that can't fulfil the order
// is disabled instead of failing at createOrder. Picking one writes back to
// the shared branch-selection store, so home/header/product availability
// all follow (see useBranches.ts). Tapping the selected branch row still
// opens its read-only info/map (BranchInfoSheet).
const Branches = ({
  branches,
  isLoading,
  isError,
  workingTime,
  value,
  error,
}: BranchesProps) => {
  const t = useTranslations();
  const {
    options,
    selectedBranch,
    availableCount,
    picker,
    infoSheet,
    handleSelect,
  } = useBranches({ branches, value });

  return (
    <section className="rounded-xl bg-white p-3">
      {isLoading ? (
        <>
          <div className="h-4 w-28 skeleton rounded-full" />
          <div className="mt-2 h-3 w-36 skeleton rounded-full" />
          <div className="mt-2 h-11 w-full skeleton rounded-lg" />
        </>
      ) : (
        <>
          <h2 className="text-sm font-medium text-black">
            {t("order_page_branches_title")}
          </h2>

          {selectedBranch ? (
            <>
              <button
                type="button"
                onClick={infoSheet.setTrue}
                className="mt-2 flex w-full items-start gap-2 text-left"
              >
                <IconMapPinFilled size={18} className="mt-0.5 shrink-0 text-gray220" />
                <span className="min-w-0 flex-1">
                  <span className="info-label block">
                    {selectedBranch.name}
                  </span>
                  <span className="info-value block">
                    {getShortAddress(selectedBranch.address)}
                  </span>
                </span>
                <ChevronRight
                  size={18}
                  className="mt-0.5 shrink-0 text-gray220"
                />
              </button>

              <Button
                type="button"
                variant="secondary"
                size="md"
                onClick={picker.setTrue}
                className="mt-2 w-full justify-center"
              >
                {t("order_page_branches_change")}
              </Button>
            </>
          ) : (
            <>
              <p className="pt-0.5 text-xs font-normal text-gray220">
                {t("order_page_branches_select_hint")}
              </p>
              <Button
                type="button"
                variant="primary-solid"
                size="md"
                onClick={picker.setTrue}
                className="mt-2 w-full justify-center"
              >
                {t("order_page_branches_select")}
              </Button>
            </>
          )}
        </>
      )}

      {error && (
        <span className="mt-2 block px-1 text-xs text-red">{error}</span>
      )}

      {isError && (
        <p className="mt-2 px-1 text-xs text-gray220">
          {t("order_page_branches_not_found")}
        </p>
      )}

      <BranchPickerSheet
        open={picker.value}
        onClose={picker.setFalse}
        options={options}
        availableCount={availableCount}
        isLoading={isLoading}
        value={value}
        workingTime={workingTime}
        onSelect={handleSelect}
      />

      <BranchInfoSheet
        open={infoSheet.value}
        onClose={infoSheet.setFalse}
        branch={selectedBranch}
        workingTime={workingTime}
      />
    </section>
  );
};

export default Branches;
