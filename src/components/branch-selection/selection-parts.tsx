"use client";

import { type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, ChevronUp, MapPin } from "lucide-react";
import { useTranslations } from "next-intl";

import { type AddressProps } from "@/apis/address";
import { getNearestBranch } from "@/apis/branches";
import type { BranchProps } from "@/types/branch";
import type { GeneralProps } from "@/types/general";

import { type BranchSelectionState } from "./useBranchSelection";
import { findClosestBranch, getBranchLabel } from "./utils";

// Rows shown before the "Yana N ta ... ko'rsatish" toggle.
export const COLLAPSED_COUNT = 3;

export const getRowClassName = (checked: boolean) =>
  `flex min-h-16 w-full items-center gap-3 rounded-2xl border px-3 py-2.5 text-left transition-colors ${
    checked
      ? "border-green-500 bg-green-500/10"
      : "border-gray180 hover:border-gray220"
  }`;

export const SectionLabel = ({ children }: { children: ReactNode }) => (
  <p className="text-[11px] font-normal  tracking-wider text-gray220">
    {children}
  </p>
);

// tone="primary" (the default) is only for the standalone "Yangi manzil
// kiriting..." row above the saved-addresses list — every row *inside*
// that list uses tone="gray" so a plain list item doesn't read as visually
// "special" the way that one dedicated action row is meant to.
export const RowIcon = ({ tone = "primary" }: { tone?: "primary" | "gray" }) => (
  <span
    className={`grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gray10 ${
      tone === "primary" ? "text-primary" : "text-gray220"
    }`}
  >
    <MapPin size={17} />
  </span>
);

export const Pill = ({
  children,
  tone = "gray",
}: {
  children: ReactNode;
  tone?: "gray" | "primary";
}) => (
  <span
    className={`shrink-0 whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-normal ${
      tone === "primary"
        ? "bg-primary10 text-primary"
        : "bg-gray10 text-gray220"
    }`}
  >
    {children}
  </span>
);

// line-clamp (not `truncate`) keeps normal wrapping, so the ellipsis lands
// after the last whole word that fits instead of cutting a word in half.
export const RowText = ({
  title,
  pill,
  description,
}: {
  title: string;
  pill?: ReactNode;
  description?: string | null;
}) => (
  <span className="min-w-0 flex-1">
    <span className="flex min-w-0 items-center gap-2">
      <span className="line-clamp-1 min-w-0 text-sm font-medium text-gray220">
        {title}
      </span>
      {pill}
    </span>
    {description && (
      <span className="mt-0.5 line-clamp-1 text-xs font-normal text-gray220">
        {description}
      </span>
    )}
  </span>
);

export const ShowMoreToggle = ({
  total,
  expanded,
  labelKey,
  onToggle,
}: {
  total: number;
  expanded: boolean;
  labelKey: string;
  onToggle: () => void;
}) => {
  const t = useTranslations();

  if (total <= COLLAPSED_COUNT) return null;

  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex h-10 items-center justify-center gap-1 rounded-xl bg-gray10 text-sm font-medium text-black"
    >
      {expanded ? (
        <>
          {t("common_show_less")}
          <ChevronUp size={16} />
        </>
      ) : (
        <>
          {t(labelKey, { count: total - COLLAPSED_COUNT })}
          <ChevronDown size={16} />
        </>
      )}
    </button>
  );
};

export const BranchPill = ({ branch }: { branch: BranchProps | null }) =>
  branch ? <Pill>{getBranchLabel(branch.name)}</Pill> : null;

// The branch that will actually serve this address — the backend's own
// nearest-branch answer (same key/fn as useBranchSelection and the order
// page, so the selected address is a shared cache hit), not a client-side
// distance guess: some branches share identical coordinates, and the
// haversine tie-break then disagreed with the backend's pick.
export const NearestBranchPill = ({
  selection,
  address,
}: {
  selection: BranchSelectionState;
  address: AddressProps;
}) => {
  const { data, isError } = useQuery({
    enabled: Boolean(selection.shopid),
    queryKey: [
      "nearest-branch",
      selection.shopid,
      address.latitude,
      address.longitude,
    ],
    queryFn: () =>
      getNearestBranch({
        shopid: selection.shopid as string,
        latitude: address.latitude,
        longitude: address.longitude,
      }),
  });

  const branch = data
    ? (selection.branches.find((item) => item.id === data.data.id) ?? null)
    : isError
      ? findClosestBranch(selection.branches, address)
      : null;

  return <BranchPill branch={branch} />;
};

export type TabProps = {
  selection: BranchSelectionState;
  workingTime?: GeneralProps["working_time"];
};
