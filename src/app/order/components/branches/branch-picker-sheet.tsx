"use client";

import { PackageX } from "lucide-react";
import { IconMapPinFilled } from "@tabler/icons-react";
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
import RadioMark, { getOptionClassName } from "@/components/ui/radio-mark";

import type { BranchOptionProps } from "./useBranches";

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
        desktopModal
        className="max-h-[85dvh] rounded-t-2xl"
      >
        <SheetHeader className="shrink-0 pr-12">
          <SheetTitle>{t("order_page_branches_picker_title")}</SheetTitle>
        </SheetHeader>

        <div className="scroll-hidden flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-4 pb-[max(20px,env(safe-area-inset-bottom))]">
          {/* Same section-label + map-link row as the home selector's pickup
              tab, so the two pickers read as the same control. */}
          <div className="flex items-center justify-between gap-2">
            <p className="text-[11px] font-normal tracking-wider text-gray220">
              {t("home_branch_selection_available_branches")}
            </p>
            {availableBranches.length > 0 && (
              <button
                type="button"
                onClick={mapPicker.setTrue}
                className="flex shrink-0 items-center gap-1 text-xs font-medium text-primary"
              >
                <IconMapPinFilled size={14} />
                {t("home_branch_selection_pick_on_map")}
              </button>
            )}
          </div>

          {isLoading ? (
            [0, 1, 2].map((key) => (
              <div
                key={key}
                className="skeleton h-19 w-full rounded-xl"
              />
            ))
          ) : options.length === 0 ? (
            <p className="py-6 text-center text-sm font-normal text-gray220">
              {t("order_page_branches_not_found")}
            </p>
          ) : (
            <>
              {hasNoneAvailable && (
                <p className="rounded-xl bg-red/10 px-3 py-2.5 text-xs font-medium text-red">
                  {t("order_page_branches_picker_none_available")}
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
                    className={`flex w-full items-start gap-3 rounded-2xl p-3 text-left ${
                      !isAvailable
                        ? "cursor-not-allowed border border-gray180 bg-white opacity-70"
                        : getOptionClassName(checked, false, "outlined")
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
                        <IconMapPinFilled size={17} />
                      ) : (
                        <PackageX size={17} />
                      )}
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="info-label line-clamp-1 block">
                        {getBranchLabel(branch.name)}
                      </span>

                      <span className="info-value line-clamp-1 block">
                        {getShortAddress(branch.address)}
                      </span>

                      {!isAvailable && (
                        <span className="mt-1.5 line-clamp-2 block text-xs font-medium text-red">
                          {t("order_page_branches_picker_missing", {
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
