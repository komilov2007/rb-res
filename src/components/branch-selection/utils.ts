import type { BranchProps } from "@/types/branch";
import { getDistanceKm } from "@/utils/distance";

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
