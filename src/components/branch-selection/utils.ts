import type { BranchProps } from "@/types/branch";
import { getDistanceKm } from "@/utils/distance";

// Moved to src/utils/address.ts (now shared well beyond this route) —
// re-exported here so every existing "./utils" import in this feature
// keeps working unchanged.
export { getBranchLabel, getShortAddress } from "@/utils/address";

export const findClosestBranch = (
  branches: BranchProps[],
  coordinates: { latitude: number; longitude: number },
) =>
  branches.reduce<{ branch: BranchProps; km: number } | null>(
    (closest, branch) => {
      const km = getDistanceKm(coordinates, branch);
      return !closest || km < closest.km ? { branch, km } : closest;
    },
    null,
  )?.branch ?? null;
