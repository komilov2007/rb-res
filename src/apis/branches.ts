import { request } from "@/configs/requests";
import type { BranchProps } from "@/types/branch";

export type BranchesParams = {
  service?: "RESERVATION";
  is_active?: boolean;
};

export const getBranches = async (shopid: string, params?: BranchesParams) => {
  return await request<BranchProps[]>(`webapp/branch/list/${shopid}`, {
    params,
  });
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
