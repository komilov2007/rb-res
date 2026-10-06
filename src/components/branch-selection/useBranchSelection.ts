"use client";

import { useQuery } from "@tanstack/react-query";
import { getNearestBranch } from "@/apis/branches";
import { useShopId } from "@/hooks/useShopId";
import { useBranchSelectionStore } from "@/stores/branch-selection";
import { useLocationStore } from "@/stores/location";
import { useBranches } from "@/hooks/useBranches";
import { REACT_QUERY_KEYS } from "@/constants/react-query-keys";
import type { BranchProps } from "@/types/branch";
import { findClosestBranch } from "./branch-selection-modal";

export const useBranchSelection = () => {
  const { shopid, hasShopId } = useShopId();
  const storedShopId = useBranchSelectionStore((state) => state.shopId);
  const storedServiceType = useBranchSelectionStore(
    (state) => state.serviceType,
  );
  const storedBranchId = useBranchSelectionStore((state) => state.branchId);
  const address = useLocationStore((state) => state.address);
  const latitude = useLocationStore((state) => state.latitude);
  const longitude = useLocationStore((state) => state.longitude);

  const branchesQuery = useBranches();
  const branches =
    branchesQuery.data?.data.filter((branch) => branch.is_active) ?? [];

  const isCurrentShop = Boolean(shopid) && storedShopId === shopid;
  const isPickupBranchGone =
    storedServiceType === "PICKUP" &&
    branchesQuery.isSuccess &&
    !branches.some((branch) => branch.id === storedBranchId);
  const serviceType =
    isCurrentShop && !isPickupBranchGone ? storedServiceType : null;
  const isDelivery = serviceType === "DELIVERY";

  const nearestBranchQuery = useQuery({
    enabled:
      hasShopId && isDelivery && Boolean(latitude) && Boolean(longitude),
    queryKey: [REACT_QUERY_KEYS.NEAREST_BRANCH, shopid, latitude, longitude],
    queryFn: () =>
      getNearestBranch({
        shopid: shopid as string,
        latitude: latitude as number,
        longitude: longitude as number,
      }),
  });

  const branchId =
    serviceType === "PICKUP"
      ? storedBranchId
      : isDelivery
        ? (nearestBranchQuery.data?.data.id ?? null)
        : null;
  const branch = branches.find((item) => item.id === branchId) ?? null;

  const hasSelection =
    serviceType === "PICKUP"
      ? storedBranchId !== null
      : serviceType === "DELIVERY"
        ? Boolean(address)
        : false;

  return {
    shopid,
    serviceType,
    branchId,
    branch,
    branches,
    hasSelection,
    address: isDelivery ? address : "",
    isReady: hasShopId && !branchesQuery.isLoading,
  };
};

export type BranchSelectionState = ReturnType<typeof useBranchSelection>;

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
