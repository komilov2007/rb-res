"use client";

import { useQuery } from "@tanstack/react-query";
import { Check, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";

import { getBranches } from "@/apis/branches";
import { getShortAddress } from "@/app/[page]/components/branch-selection/utils";
import { useShopid } from "@/hooks/useShopId";
import { useBranchSelectionStore } from "@/stores/branch-selection";
import type { BranchProps } from "@/types/branch";
import type { ProductProps } from "@/types/product";

type UnavailableBranchListProps = {
  product: ProductProps;
  onSelect: (branch: BranchProps) => void;
};

// Mounted only while its popover is open (see unavailable-popover.tsx: it
// doesn't exist in the tree at all while closed), so this query only ever
// runs on demand — not once per card in the grid. Same ["branches", shopid]
// query key the rest of the app already shares (useBranchSelection,
// BranchMapPicker, ...), so it's usually already warm from the cache.
// Reads the raw store branchId directly (not the fuller useBranchSelection,
// which also resolves a delivery nearest-branch and would mean an extra
// query call for something this only uses for the current-branch name) —
// picking a branch here always becomes a pickup selection, so the stored
// pickup branchId is exactly what "the current branch" means.
const UnavailableBranchList = ({
  product,
  onSelect,
}: UnavailableBranchListProps) => {
  const t = useTranslations();
  const currentBranchId = useBranchSelectionStore((state) => state.branchId);
  const { shopid, hasShopId } = useShopid();
  const { data, isLoading } = useQuery({
    enabled: hasShopId,
    queryKey: ["branches", shopid],
    queryFn: () => getBranches(shopid as string),
  });

  const allBranches = data?.data ?? [];
  const currentBranchName = allBranches.find(
    (branch) => branch.id === currentBranchId,
  )?.name;
  const availableBranches = allBranches.filter(
    (branch) => branch.is_active && product.branches?.includes(branch.id),
  );
  // Two branches can share a display name (e.g. two "Chilonzor" locations)
  // — that's real shop data, not a bug (confirmed against the live branch
  // list API), but showing just the name in that case reads as the same
  // place twice. The address underneath disambiguates it whenever that
  // happens, so it's shown for every available row rather than only
  // conditionally for colliding names.
  const availableRow = (branch: BranchProps) => (
    <button
      key={branch.id}
      type="button"
      onClick={() => onSelect(branch)}
      className="flex w-full items-center gap-2.5 rounded-xl bg-primary10 px-3 py-2.5 text-left transition-colors hover:bg-primary10/70"
    >
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-bold text-black">
          {t("product_available_in_branch", { name: branch.name })}
        </span>
        <span className="block truncate text-xs font-medium text-gray220">
          {getShortAddress(branch.address)}
        </span>
      </span>
      {branch.id === currentBranchId ? (
        <Check size={16} strokeWidth={3} className="shrink-0 text-gray220" />
      ) : (
        <ChevronRight size={16} className="shrink-0 text-gray220" />
      )}
    </button>
  );

  return (
    <div className="flex flex-col gap-2">
      {/* "<branch>da yo'q" — muted/small, states the problem. The row(s)
          below are what's meant to actually draw the eye (accent color). */}
      <p className="text-xs font-medium text-gray220">
        {currentBranchName
          ? t("product_not_in_branch", { name: currentBranchName })
          : t("product_not_in_this_branch")}
      </p>

      {isLoading ? (
        <p className="py-2 text-center text-xs font-medium text-gray220">
          {t("common_loading")}
        </p>
      ) : availableBranches.length === 0 ? (
        <p className="py-2 text-center text-xs font-medium text-gray220">
          {t("product_not_in_any_branch")}
        </p>
      ) : availableBranches.length === 1 ? (
        availableRow(availableBranches[0])
      ) : (
        <ul className="scroll-hidden flex max-h-45 flex-col gap-1.5 overflow-y-auto">
          {availableBranches.map((branch) => (
            <li key={branch.id}>{availableRow(branch)}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default UnavailableBranchList;
