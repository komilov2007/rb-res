import { request } from "@/configs/requests";
import type { BranchProps } from "@/types/branch";

export const getBranches = async (shopid: string) => {
  return await request<BranchProps[]>(`webapp/branch/list/${shopid}`);
};

export const getNearestBranch = async ({
  shopid,
  latitude,
  longitude,
}: {
  shopid: string;
  latitude: number;
  longitude: number;
}) => {
  return await request<BranchProps>(
    `branch/nearest/${shopid}?lat=${latitude}&long=${longitude}`,
  );
};
