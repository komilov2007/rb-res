"use client";

import { useState } from "react";
import { MapPin } from "lucide-react";
import { useTranslations } from "next-intl";

import { BranchMapPicker } from "@/components/branch-map-picker";
import { useBoolean } from "@/hooks/useBoolean";
import { useDeviceLocation } from "@/hooks/useDeviceLocation";
import { useBranchSelectionStore } from "@/stores/branch-selection";
import { useLocationStore } from "@/stores/location";
import { getDistanceKm } from "@/utils/distance";
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

export const PickupTab = ({ selection, workingTime }: TabProps) => {
  const t = useTranslations();
  const latitude = useLocationStore((state) => state.latitude);
  const longitude = useLocationStore((state) => state.longitude);
  const setPickup = useBranchSelectionStore((state) => state.setPickup);
  const setSelectionModal = useBranchSelectionStore(
    (state) => state.setSelectionModal,
  );
  const [expanded, setExpanded] = useState(false);
  const mapPicker = useBoolean();
  const hasAddressCoords = latitude !== null && longitude !== null;
  // Without a saved delivery point, distances fall back to the device
  // location (silently skipped if unavailable or denied).
  const deviceCoords = useDeviceLocation(!hasAddressCoords);

  const origin =
    latitude !== null && longitude !== null
      ? { latitude, longitude }
      : deviceCoords;
  // Nearest first; API order when no origin is known.
  const branches = selection.branches
    .map((branch) => ({
      branch,
      km: origin ? getDistanceKm(origin, branch) : null,
    }))
    .sort((a, b) => (a.km ?? 0) - (b.km ?? 0));
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
          onClick={mapPicker.setTrue}
          className="flex shrink-0 items-center gap-1 text-xs font-bold text-primary"
        >
          <MapPin size={14} />
          {t("home_branch_selection_pick_on_map")}
        </button>
      </div>

      {branches.length === 0 && (
        <p className="py-2 text-sm font-normal text-gray220">
          {t("home_branch_selection_branches_not_found")}
        </p>
      )}

      {visibleBranches.map(({ branch }) => {
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

      <BranchMapPicker
        open={mapPicker.value}
        onClose={mapPicker.setFalse}
        branches={selection.branches}
        workingTime={workingTime}
        value={selection.serviceType === "PICKUP" ? selection.branchId : null}
        onSelect={(branchId) => {
          if (!selection.shopid) return;

          setPickup(selection.shopid, branchId);
          // A pick is final — close right away, same as the list rows above.
          setSelectionModal(false);
        }}
      />
    </div>
  );
};
