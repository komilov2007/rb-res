import { Store } from "lucide-react";

import { getBranchLabel } from "@/utils/address";
import type { BranchProps } from "@/types/branch";

type BranchRowProps = {
  branch: BranchProps;
  isActive: boolean;
  onClick: () => void;
};

// One address row of the desktop drawer's list. The classes come from
// selection-parts, so these rows look exactly like the pickup tab's own rows
// behind the drawer.
const BranchRow = ({ branch, isActive, onClick }: BranchRowProps) => (
  <button
    type="button"
    onClick={onClick}
    className={`relative flex w-full items-start gap-3 py-3 pl-5 pr-4 text-left transition-colors ${
      isActive ? "bg-green-500/10" : "hover:bg-gray10/70"
    }`}
  >
    {/* A left accent bar instead of a radio dot: tapping a row only points
        the map at that branch — the actual pick is the footer button — so a
        radiogroup was saying the wrong thing. Green tokens are the app's own
        selected treatment (see getOptionClassName). */}
    <span
      className={`absolute inset-y-0 left-0 w-[3px] ${
        isActive ? "bg-green-500" : "bg-transparent"
      }`}
    />
    <span
      className={`mt-0.5 shrink-0 ${
        isActive ? "text-green-500" : "text-gray220"
      }`}
    >
      <Store size={16} />
    </span>
    {/* RowText's own markup, inlined only to give the address two lines —
        these addresses are long enough that one line cut most of them off. */}
    <span className="min-w-0 flex-1">
      <span className="info-label line-clamp-1">
        {getBranchLabel(branch.name)}
      </span>
      <span className="info-value line-clamp-2">{branch.address}</span>
    </span>
  </button>
);

export default BranchRow;
