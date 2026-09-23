"use client";

import { useState, type ComponentType } from "react";
import { Store } from "lucide-react";
import { IconTruckFilled } from "@tabler/icons-react";
import { useTranslations } from "next-intl";

import { DialogTitle } from "@/components/ui/dialog";
import { type BranchSelectionServiceType } from "@/stores/branch-selection";
import type { BranchProps } from "@/types/branch";

import { TabProps } from "./selection-parts";
import { DeliveryTab } from "./delivery-tab";
import { PickupTab } from "./pickup-tab";

export const TABS = [
  { value: "DELIVERY", label: "home_branch_selection_tab_delivery", Icon: IconTruckFilled },
  { value: "PICKUP", label: "home_branch_selection_tab_pickup", Icon: Store },
] as const satisfies readonly {
  value: BranchSelectionServiceType;
  label: string;
  // Tabler and lucide icon components have incompatible prop types (`stroke`
  // differs), and these two tabs come one from each, so the annotation covers
  // only what the render below actually passes.
  Icon: ComponentType<{ size?: number }>;
}[];

export type SelectionContentProps = TabProps & {
  canDeliver: boolean;
  canPickup: boolean;
  // Delivery's own map (the address picker).
  onOpenMap: () => void;
  // Pickup's branch map picker, and the branches it and the pickup rows
  // share — both owned by BranchSelectionModal, see PickupTab's props.
  onOpenPickupMap: () => void;
  pickupBranches: BranchProps[];
};

// Mounted fresh on every open (Dialog unmounts closed content), so the tab
// starts on the current selection.
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
    // w-full/min-w-0: DialogContent is a grid, whose items otherwise grow to
    // fit the longest unwrapped line.
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
