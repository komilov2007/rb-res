"use client";

import { useState, type ComponentType } from "react";
import { Store, ChevronRight } from "lucide-react";
import { IconTruckFilled, IconMapPinFilled } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { DialogTitle } from "@/components/ui/dialog";
import { type BranchSelectionServiceType, useBranchSelectionStore } from "@/stores/branch-selection";
import type { BranchProps } from "@/types/branch";
import { TabProps } from "./selection-parts";
import { DeliveryTab } from "./delivery-tab";
import { PickupTab } from "./pickup-tab";
import { useAuthStore } from "@/stores/auth";
import { useBranchSelection } from "./useBranchSelection";
import { getBranchLabel, getShortAddress } from "./branch-selection-modal";

export const TABS = [
  { value: "DELIVERY", label: "home_branch_selection_tab_delivery", Icon: IconTruckFilled },
  { value: "PICKUP", label: "home_branch_selection_tab_pickup", Icon: Store },
] as const satisfies readonly {
  value: BranchSelectionServiceType;
  label: string;
  Icon: ComponentType<{ size?: number }>;
}[];

export type SelectionContentProps = TabProps & {
  canDeliver: boolean;
  canPickup: boolean;
  onOpenMap: () => void;
  onOpenPickupMap: () => void;
  pickupBranches: BranchProps[];
};

export const SelectionContent = ({
  selection,
  canDeliver,
  canPickup,
  onOpenMap,
  onOpenPickupMap,
  pickupBranches,
  workingTime,
}: SelectionContentProps) => {
  const t = useTranslations();
  const [tab, setTab] = useState<BranchSelectionServiceType>(
    selection.serviceType ?? (canDeliver ? "DELIVERY" : "PICKUP"),
  );
  const tabs = TABS.filter((item) =>
    item.value === "DELIVERY" ? canDeliver : canPickup,
  );

  return (
    <div className="flex max-h-[85dvh] w-full min-w-0 flex-col">
      <div className="shrink-0 px-5 pb-1 pr-14 pt-5">
        <DialogTitle className="text-lg font-medium text-black">
          {t("home_branch_selection_title")}
        </DialogTitle>
      </div>

      <div className="scroll-panel flex min-h-0 flex-col gap-4 overflow-y-auto p-5">
        {tabs.length > 1 && (
          <div className="grid grid-cols-2 gap-1 rounded-2xl bg-gray10 p-1">
            {tabs.map(({ value, label, Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => setTab(value)}
                className={`flex h-10 items-center justify-center gap-2 rounded-xl text-sm font-medium outline-none transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary/30 ${
                  tab === value
                    ? "bg-white text-black shadow-[0_1px_3px_rgba(17,24,39,0.08)]"
                    : "text-gray220 hover:text-black"
                }`}
              >
                <Icon size={16} />
                {t(label)}
              </button>
            ))}
          </div>
        )}

        {tab === "DELIVERY" ? (
          <DeliveryTab selection={selection} onOpenMap={onOpenMap} />
        ) : (
          <PickupTab
            selection={selection}
            workingTime={workingTime}
            branches={pickupBranches}
            onOpenMap={onOpenPickupMap}
          />
        )}
      </div>
    </div>
  );
};

type BranchSelectionChipProps = {
  className?: string;
  labelClassName?: string;
};

const BranchSelectionChip = ({
  className = "",
  labelClassName = "text-gray220",
}: BranchSelectionChipProps) => {
  const t = useTranslations();
  const { serviceType, branch, address } = useBranchSelection();
  const setSelectionModal = useBranchSelectionStore(
    (state) => state.setSelectionModal,
  );
  const setPendingSelection = useBranchSelectionStore(
    (state) => state.setPendingSelection,
  );
  const hasAccess = useAuthStore((state) => state.hasAccess);
  const setLoginModal = useAuthStore((state) => state.setLoginModal);

  const handleClick = () => {
    if (!hasAccess) {
      setPendingSelection(true);
      setLoginModal(true);
      return;
    }

    setSelectionModal(true);
  };

  const isPickup = serviceType === "PICKUP";
  const Icon = isPickup ? Store : IconMapPinFilled;
  const label = isPickup
    ? t("pickup")
    : serviceType === "DELIVERY"
      ? t("delivery_address")
      : t("home_branch_selection_choose_address");
  const value = isPickup
    ? getBranchLabel(branch?.name)
    : serviceType === "DELIVERY" && address
      ? getShortAddress(address)
      : null;

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`flex min-w-0 flex-col items-start text-left ${className}`}
    >
      <span className={`flex items-center gap-1 text-xs font-normal leading-4 ${labelClassName}`}>
        <Icon size={13} strokeWidth={2.2} className={`shrink-0 ${labelClassName}`} />
        {label}
      </span>
      <span className="mt-0.5 flex w-full min-w-0 items-center gap-0.5">
        <span
          className={`min-w-0 truncate text-sm leading-5 ${
            value ? "font-medium text-black" : "font-normal text-gray220"
          }`}
        >
          {value ?? t("home_branch_selection_not_selected")}
        </span>
        <ChevronRight size={15} className="shrink-0 text-gray220" />
      </span>
    </button>
  );
};

export { BranchSelectionChip };
