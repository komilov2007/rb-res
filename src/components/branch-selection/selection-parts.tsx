"use client";

import { type ReactNode } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { IconMapPinFilled } from "@tabler/icons-react";
import { useTranslations } from "next-intl";

import { type AddressProps } from "@/apis/address";
import type { BranchProps } from "@/types/branch";
import type { GeneralProps } from "@/types/general";

import { type BranchSelectionState } from "./useBranchSelection";
import { useAddressBranch } from "./useAddressBranch";
import { getBranchLabel } from "./utils";
import { getOptionClassName } from "@/components/ui/radio-mark";

// Rows shown before the "Yana N ta ... ko'rsatish" toggle.
export const COLLAPSED_COUNT = 3;

// Same option look as every radio row in the app (see RadioMark).
export const getRowClassName = (checked: boolean) =>
  `flex min-h-16 w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left ${getOptionClassName(checked)}`;

export const SectionLabel = ({ children }: { children: ReactNode }) => (
  <p className="px-1 text-xs font-normal text-gray220">
    {children}
  </p>
);

// tone="primary" (the default) is only for the standalone "Yangi manzil
// kiriting..." row above the saved-addresses list — every row *inside*
// that list uses tone="gray" so a plain list item doesn't read as visually
// "special" the way that one dedicated action row is meant to.
export const RowIcon = ({ tone = "primary" }: { tone?: "primary" | "gray" }) => (
  <span
    className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${
      tone === "primary" ? "bg-primary10 text-primary" : "bg-white text-gray220"
    }`}
  >
    <IconMapPinFilled size={17} />
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
        : "bg-white text-gray220"
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
      <span className="info-label line-clamp-1 min-w-0">
        {title}
      </span>
      {pill}
    </span>
    {description && (
      <span className="info-value line-clamp-1">
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
      className="flex h-9 items-center justify-center gap-1 rounded-xl text-sm font-medium text-primary transition-colors hover:bg-primary10"
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

// The branch that will actually serve this address (see useAddressBranch).
export const NearestBranchPill = ({
  selection,
  address,
}: {
  selection: BranchSelectionState;
  address: AddressProps;
}) => {
  const branch = useAddressBranch(selection.shopid, selection.branches, address);

  return <BranchPill branch={branch} />;
};

export type TabProps = {
  selection: BranchSelectionState;
  workingTime?: GeneralProps["working_time"];
};
