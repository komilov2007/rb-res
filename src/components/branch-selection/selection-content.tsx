"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import { DialogTitle } from "@/components/ui/dialog";
import { type BranchSelectionServiceType } from "@/stores/branch-selection";

import { TabProps } from "./selection-parts";
import { DeliveryTab } from "./delivery-tab";
import { PickupTab } from "./pickup-tab";

export const TABS: { value: BranchSelectionServiceType; label: string }[] = [
  { value: "DELIVERY", label: "home_branch_selection_tab_delivery" },
  { value: "PICKUP", label: "home_branch_selection_tab_pickup" },
];

export type SelectionContentProps = TabProps & {
  canDeliver: boolean;
  canPickup: boolean;
  onOpenMap: () => void;
};

// Mounted fresh on every open (Dialog unmounts closed content), so the tab
// starts on the current selection.
export const SelectionContent = ({
  selection,
  canDeliver,
  canPickup,
  onOpenMap,
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
      <div className="shrink-0 border-b border-gray180 px-5 pb-4 pr-14 pt-5">
        <DialogTitle className="text-lg font-bold text-black">
          {t("home_branch_selection_title")}
        </DialogTitle>
      </div>

      <div className="flex min-h-0 flex-col gap-4 overflow-y-auto p-5">
        {tabs.length > 1 && (
          <div className="grid grid-cols-2 gap-1 rounded-2xl bg-gray10 p-1">
            {tabs.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setTab(item.value)}
                className={`h-10 rounded-xl border text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-black/20 ${
                  tab === item.value
                    ? "border-gray180 bg-white font-bold text-black"
                    : "border-transparent text-gray220"
                }`}
              >
                {t(item.label)}
              </button>
            ))}
          </div>
        )}

        {tab === "DELIVERY" ? (
          <DeliveryTab selection={selection} onOpenMap={onOpenMap} />
        ) : (
          <PickupTab selection={selection} workingTime={workingTime} />
        )}
      </div>
    </div>
  );
};
