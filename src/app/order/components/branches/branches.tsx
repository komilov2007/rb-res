"use client";

import { useFormContext } from "react-hook-form";
import { useBoolean } from "@/hooks/useBoolean";
import { useShopId } from "@/hooks/useShopId";
import { useBranchSelectionStore } from "@/stores/branch-selection";
import { useCartStore } from "@/stores/cart";
import { useLocationStore } from "@/stores/location";
import type { BranchProps } from "@/types/branch";
import type { CartItemProps } from "@/types/cart";
import type { OrderFormValues } from "@/types/order";
import { getDistanceKm } from "@/utils/distance";
import { ChevronRight } from "lucide-react";
import { IconMapPinFilled } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import BranchInfoSheet from "@/components/branch-info-sheet";
import Button from "@/components/ui/button";
import type { GeneralProps } from "@/types/general";
import { getShortAddress } from "@/utils/address";
import BranchPickerSheet from "./branch-picker-sheet";

export type BranchOptionProps = {
  branch: BranchProps;
  km: number | null;
  missingNames: string[];
  isAvailable: boolean;
};

const isMissingAt = (item: CartItemProps, branchId: number) => {
  const branches = item.product.branches;

  return Array.isArray(branches) && branches.length > 0
    ? !branches.includes(branchId)
    : false;
};

type UseBranchesProps = {
  branches?: BranchProps[];
  value: number | null;
};

export const useBranches = ({ branches, value }: UseBranchesProps) => {
  const { setValue } = useFormContext<OrderFormValues>();
  const { shopid } = useShopId();
  const setPickup = useBranchSelectionStore((state) => state.setPickup);
  const carts = useCartStore((state) => state.carts);
  const latitude = useLocationStore((state) => state.latitude);
  const longitude = useLocationStore((state) => state.longitude);
  const picker = useBoolean();
  const infoSheet = useBoolean();

  const orderedItems = carts.filter((item) => item.is_active !== false);
  const origin =
    latitude !== null && longitude !== null ? { latitude, longitude } : null;

  const options: BranchOptionProps[] = (branches ?? [])
    .filter((branch) => branch.is_active)
    .map((branch) => {
      const missingNames = orderedItems
        .filter((item) => isMissingAt(item, branch.id))
        .map((item) => item.product.name);

      return {
        branch,
        km: origin ? getDistanceKm(origin, branch) : null,
        missingNames,
        isAvailable: missingNames.length === 0,
      };
    })
    .sort((a, b) => {
      if (a.isAvailable !== b.isAvailable) return a.isAvailable ? -1 : 1;

      return (a.km ?? 0) - (b.km ?? 0);
    });

  const selectedBranch =
    branches?.find((branch) => branch.id === value) ?? null;
  const availableCount = options.filter((option) => option.isAvailable).length;

  const handleSelect = (branchId: number) => {
    setValue("branch", branchId, { shouldValidate: true });

    if (shopid) setPickup(shopid, branchId);

    picker.setFalse();
  };

  return {
    options,
    selectedBranch,
    availableCount,
    picker,
    infoSheet,
    handleSelect,
  };
};

type BranchesProps = {
  branches?: BranchProps[];
  isLoading: boolean;
  isError: boolean;
  workingTime?: GeneralProps["working_time"];
  value: number | null;
  error?: string;
};

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

export { Branches };

export default Branches;
