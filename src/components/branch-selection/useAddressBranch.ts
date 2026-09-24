"use client";

import { useQuery } from "@tanstack/react-query";

import { getNearestBranch } from "@/apis/branches";
import { REACT_QUERY_KEYS } from "@/constants/react-query-keys";
import type { BranchProps } from "@/types/branch";

import { findClosestBranch } from "./utils";

// The branch that will actually serve a delivery to this address — the
// backend's own nearest-branch answer (same key/fn as useBranchSelection and
// the order page, so it's a shared cache hit), not a client-side distance
// guess: branches can share identical coordinates, and the backend's own
// distance can pick differently from haversine. Every place that shows an
// address's branch uses this, so they always agree with the order. Falls
// back to the closest branch only if that request fails.
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
