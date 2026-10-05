import { Store } from "lucide-react";

import { getBranchLabel } from "@/utils/address";
import type { BranchProps } from "@/types/branch";

type BranchRowProps = {
  branch: BranchProps;
  isActive: boolean;
  onClick: () => void;
};

const BranchRow = ({ branch, isActive, onClick }: BranchRowProps) => (
  <button
    type="button"
    onClick={onClick}
    className={`relative flex w-full items-start gap-3 py-3 pl-5 pr-4 text-left transition-colors ${
      isActive ? "bg-green-500/10" : "hover:bg-gray10/70"
    }`}
  >
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
    <span className="min-w-0 flex-1">
      <span className="info-label line-clamp-1">
        {getBranchLabel(branch.name)}
      </span>
      <span className="info-value line-clamp-2">{branch.address}</span>
    </span>
  </button>
);

export default BranchRow;
