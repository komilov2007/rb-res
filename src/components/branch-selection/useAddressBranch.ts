"use client";

import { useQuery } from "@tanstack/react-query";

import { getNearestBranch } from "@/apis/branches";
import { REACT_QUERY_KEYS } from "@/constants/react-query-keys";
import type { BranchProps } from "@/types/branch";

import { findClosestBranch } from "./utils";

export const useAddressBranch = (
  shopid: string | null | undefined,
  branches: BranchProps[],
  address: { latitude: number; longitude: number },
) => {
  const { data, isError } = useQuery({
    enabled: Boolean(shopid),
    queryKey: [
      REACT_QUERY_KEYS.NEAREST_BRANCH,
      shopid,
      address.latitude,
      address.longitude,
    ],
    queryFn: () =>
      getNearestBranch({
        shopid: shopid as string,
        latitude: address.latitude,
        longitude: address.longitude,
      }),
  });

  if (data) return branches.find((item) => item.id === data.data.id) ?? null;

  return isError ? findClosestBranch(branches, address) : null;
};
