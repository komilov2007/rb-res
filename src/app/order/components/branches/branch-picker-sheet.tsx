"use client";

import { Check, MapPin, PackageX } from "lucide-react";
import { useTranslations } from "next-intl";

import { BranchMapPicker } from "@/components/branch-map-picker";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useBoolean } from "@/hooks/useBoolean";
import type { GeneralProps } from "@/types/general";
import { getBranchLabel, getShortAddress } from "@/utils/address";

import type { BranchOptionProps } from "./useBranches";

const RadioMark = ({ checked }: { checked: boolean }) => (
  <span
    className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 ${
      checked
        ? "border-green-500 bg-green-500 text-white"
        : "border-gray180 bg-white"
    }`}
  >
    {checked && <Check size={14} strokeWidth={3} />}
  </span>
);

type BranchPickerSheetProps = {
  open: boolean;
  onClose: () => void;
  options: BranchOptionProps[];
  availableCount: number;
  isLoading: boolean;
  value: number | null;
  workingTime?: GeneralProps["working_time"];
  onSelect: (branchId: number) => void;
};

// The order page's own pickup-branch picker: unlike the home page's
// selector (src/app/[page]/components/branch-selection), every row here is
// checked against what's actually in the cart — a branch that doesn't stock
// all of it can't be picked, because createOrder would just come back with
// unavailable_products. The missing item names are spelled out on the row
// so the reason is visible without trial and error.
//
// "Xaritadan tanlash" opens the very same BranchMapPicker the home
// selector's own map link opens, so both entry points look and behave
// identically — just narrowed to the branches that can actually fulfil this
// cart, for the same reason the rows are.
const BranchPickerSheet = ({
  open,
  onClose,
  options,
  availableCount,
  isLoading,
  value,
  workingTime,
  onSelect,
}: BranchPickerSheetProps) => {
  const t = useTranslations();
  const mapPicker = useBoolean();
  const hasNoneAvailable =
    !isLoading && options.length > 0 && availableCount === 0;
  const availableBranches = options
    .filter((option) => option.isAvailable)
    .map((option) => option.branch);

  const handleMapSelect = (branchId: number) => {
    mapPicker.setFalse();
    onSelect(branchId);
  };

  return (
    <Sheet open={open} onOpenChange={(next) => !next && onClose()}>
      <SheetContent
        side="bottom"
        className="max-h-[85dvh] rounded-t-3xl bg-gray10"
      >
        <SheetHeader className="shrink-0 pr-12">
          <SheetTitle>{t("order_page.branches.picker_title")}</SheetTitle>
        </SheetHeader>

        <div className="scroll-hidden flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-4 pb-[max(20px,env(safe-area-inset-bottom))]">
          {/* Same section-label + map-link row as the home selector's pickup
              tab, so the two pickers read as the same control. */}
          <div className="flex items-center justify-between gap-3">
            <p className="text-[11px] font-normal tracking-wider text-gray220">
              {t("home.branch_selection.available_branches")}
            </p>
            {availableBranches.length > 0 && (
              <button
                type="button"
                onClick={mapPicker.setTrue}
                className="flex shrink-0 items-center gap-1 text-xs font-bold text-primary"
              >
                <MapPin size={14} />
                {t("home.branch_selection.pick_on_map")}
              </button>
            )}
          </div>

          {isLoading ? (
            [0, 1, 2].map((key) => (
              <div
                key={key}
                className="h-19 w-full animate-pulse rounded-2xl bg-white/70"
              />
            ))
          ) : options.length === 0 ? (
            <p className="py-6 text-center text-sm font-medium text-gray220">
              {t("order_page.branches.not_found")}
            </p>
          ) : (
            <>
              {hasNoneAvailable && (
                <p className="rounded-2xl bg-red/10 px-3 py-2.5 text-xs font-medium text-red">
                  {t("order_page.branches.picker_none_available")}
                </p>
              )}

              {options.map(({ branch, missingNames, isAvailable }) => {
                const checked = branch.id === value;

                return (
                  <button
                    key={branch.id}
                    type="button"
                    disabled={!isAvailable}
                    onClick={() => onSelect(branch.id)}
                    className={`flex w-full items-start gap-3 rounded-2xl border p-3 text-left transition-colors ${
                      !isAvailable
                        ? "cursor-not-allowed border-transparent bg-white/60 opacity-70"
                        : checked
                          ? "border-green-500 bg-white"
                          : "border-transparent bg-white hover:border-gray180"
                    }`}
                  >
                    <span
                      className={`mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full ${
                        isAvailable
                          ? "bg-gray10 text-gray220"
                          : "bg-red/10 text-red"
                      }`}
                    >
                      {isAvailable ? (
                        <MapPin size={17} />
                      ) : (
                        <PackageX size={17} />
                      )}
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="line-clamp-1 block text-sm font-bold text-black">
                        {getBranchLabel(branch.name)}
                      </span>

                      <span className="mt-0.5 line-clamp-1 block text-xs font-medium text-gray220">
                        {getShortAddress(branch.address)}
                      </span>

                      {!isAvailable && (
                        <span className="mt-1.5 line-clamp-2 block text-xs font-medium text-red">
                          {t("order_page.branches.picker_missing", {
                            names: missingNames.join(", "),
                          })}
                        </span>
                      )}
                    </span>

                    {isAvailable && <RadioMark checked={checked} />}
                  </button>
                );
              })}
            </>
          )}
        </div>
      </SheetContent>

      <BranchMapPicker
        open={mapPicker.value}
        onClose={mapPicker.setFalse}
        branches={availableBranches}
        workingTime={workingTime}
        value={value}
        onSelect={handleMapSelect}
      />
    </Sheet>
  );
};

export default BranchPickerSheet;
