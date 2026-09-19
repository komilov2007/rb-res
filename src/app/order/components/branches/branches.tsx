"use client";

import { MapPin } from "lucide-react";
import { useTranslations } from "next-intl";

import BranchInfoSheet from "@/components/branch-info-sheet";
import { useBoolean } from "@/hooks/useBoolean";
import type { BranchProps } from "@/types/branch";
import type { GeneralProps } from "@/types/general";

type BranchesProps = {
  branches?: BranchProps[];
  isLoading: boolean;
  isError: boolean;
  workingTime?: GeneralProps["working_time"];
  value: number | null;
  error?: string;
};

// The store branch is no longer picked from the order page — it always
// mirrors whatever's selected on the home page's own branch selector
// (src/app/[page]/components/branch-selection), synced into the order form
// by usePage.ts. This is now read-only: "Filialni ko'rish" opens the same
// branch's info (BranchInfoSheet), with no way to choose a different one —
// that only happens from home.
const Branches = ({
  branches,
  isLoading,
  isError,
  workingTime,
  value,
  error,
}: BranchesProps) => {
  const t = useTranslations();
  const infoSheet = useBoolean();
  const selectedBranch =
    branches?.find((branch) => branch.id === value) ?? null;

  return (
    <section className="rounded-2xl bg-white p-4">
      {isLoading ? (
        <>
          <div className="h-4 w-28 animate-pulse rounded-full bg-gray10/50" />
          <div className="mt-2 h-3 w-36 animate-pulse rounded-full bg-gray10/50" />
          <div className="mt-3 h-11 w-full animate-pulse rounded-xl bg-gray10/50" />
        </>
      ) : (
        <>
          <h2 className="text-sm font-bold text-black">
            {t("order_page.branches.title")}
          </h2>

          {selectedBranch ? (
            <>
              <hr className="my-3 border-gray180" />
              <div className="flex items-start gap-3">
                <MapPin size={18} className="mt-0.5 shrink-0 text-gray220" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-black">
                    {t("order_page.branches.branch")}
                  </p>
                  <p className="mt-0.5 text-xs font-medium text-gray220">
                    {selectedBranch.address}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={infoSheet.setTrue}
                className="mt-3 h-11 w-full rounded-xl bg-gray10 text-sm font-bold text-black"
              >
                {t("order_page.branches.view")}
              </button>
            </>
          ) : (
            <p className="pt-0.5 text-xs font-medium text-gray220">
              {t("order_page.branches.select_on_home")}
            </p>
          )}
        </>
      )}

      {error && (
        <span className="mt-2 block px-1 text-xs text-red">{error}</span>
      )}

      {isError && (
        <p className="mt-2 px-1 text-xs text-gray220">
          {t("order_page.branches.not_found")}
        </p>
      )}

      <BranchInfoSheet
        open={infoSheet.value}
        onClose={infoSheet.setFalse}
        branch={selectedBranch}
        workingTime={workingTime}
      />
    </section>
  );
};

export default Branches;
