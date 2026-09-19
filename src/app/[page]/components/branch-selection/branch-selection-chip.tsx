"use client";

import { ChevronRight, MapPin, Store } from "lucide-react";
import { useTranslations } from "next-intl";

import { useAuthStore } from "@/stores/auth";
import { useBranchSelectionStore } from "@/stores/branch-selection";

import { useBranchSelection } from "./useBranchSelection";
import { getBranchLabel, getShortAddress } from "./utils";

type BranchSelectionChipProps = {
  className?: string;
  // Mobile's banner header wants this label (delivery/pickup mode + its
  // icon) in the primary color to stand out; desktop's topbar keeps it
  // neutral gray like the rest of that row. Same component either way —
  // only this one accent differs per caller.
  labelClassName?: string;
};

// Header selector for the current delivery/pickup choice: a small mode label
// over the selected address/branch. Tapping it opens the selection modal
// (changing the choice happens there). Reads the stores directly, so a pick
// in the modal shows up immediately.
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

  // Choosing an address requires login; BranchSelectionModal reopens the
  // selection once the guest has logged in.
  const handleClick = () => {
    if (!hasAccess) {
      setPendingSelection(true);
      setLoginModal(true)();
      return;
    }

    setSelectionModal(true);
  };

  const isPickup = serviceType === "PICKUP";
  const Icon = isPickup ? Store : MapPin;
  const label = isPickup
    ? t("pickup")
    : serviceType === "DELIVERY"
      ? t("delivery_address")
      : t("home.branch_selection.choose_address");
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
        {/* `truncate` sizes the text box to the visible text, so the chevron
            sits right after the ellipsis (line-clamp keeps the full width and
            leaves a gap before it). */}
        <span
          className={`min-w-0 truncate text-sm leading-5 ${
            value ? "font-medium text-black" : "font-normal text-gray220"
          }`}
        >
          {value ?? t("home.branch_selection.not_selected")}
        </span>
        <ChevronRight size={15} className="shrink-0 text-gray220" />
      </span>
    </button>
  );
};

export default BranchSelectionChip;
