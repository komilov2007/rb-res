"use client";

import { ChevronRight, MapPin } from "lucide-react";
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
    <section className="rounded-2xl bg-white p-4">
      {isLoading ? (
        <>
          <div className="h-4 w-28 animate-pulse rounded-full bg-gray10/50" />
          <div className="mt-2 h-3 w-36 animate-pulse rounded-full bg-gray10/50" />
          <div className="mt-3 h-11 w-full animate-pulse rounded-xl bg-gray10/50" />
        </>
      ) : (
        <>
          <h2 className="text-sm font-bold text-black">
            {t("order_page.branches.title")}
          </h2>

          {selectedBranch ? (
            <>
              <hr className="my-3 border-gray180" />
              <button
                type="button"
                onClick={infoSheet.setTrue}
                className="flex w-full items-start gap-3 text-left"
              >
                <MapPin size={18} className="mt-0.5 shrink-0 text-gray220" />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-bold text-black">
                    {selectedBranch.name}
                  </span>
                  <span className="mt-0.5 block text-xs font-medium text-gray220">
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
                className="mt-3 w-full justify-center"
              >
                {t("order_page.branches.change")}
              </Button>
            </>
          ) : (
            <>
              <p className="pt-0.5 text-xs font-medium text-gray220">
                {t("order_page.branches.select_hint")}
              </p>
              <Button
                type="button"
                variant="primary-solid"
                size="md"
                onClick={picker.setTrue}
                className="mt-3 w-full justify-center"
              >
                {t("order_page.branches.select")}
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
          {t("order_page.branches.not_found")}
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
