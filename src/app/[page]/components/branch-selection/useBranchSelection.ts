"use client";

import { useQuery } from "@tanstack/react-query";

import { getBranches, getNearestBranch } from "@/apis/branches";
import { useShopid } from "@/hooks/useShopId";
import { useBranchSelectionStore } from "@/stores/branch-selection";
import { useLocationStore } from "@/stores/location";

// Home page delivery/pickup choice and the branch it resolves to — pickup
// uses the stored branch, delivery the nearest branch to the saved address.
export const useBranchSelection = () => {
  const { shopid, hasShopId } = useShopid();
  const storedShopId = useBranchSelectionStore((state) => state.shopId);
  const storedServiceType = useBranchSelectionStore(
    (state) => state.serviceType,
  );
  const storedBranchId = useBranchSelectionStore((state) => state.branchId);
  const address = useLocationStore((state) => state.address);
  const latitude = useLocationStore((state) => state.latitude);
  const longitude = useLocationStore((state) => state.longitude);

  const branchesQuery = useQuery({
    enabled: hasShopId,
    queryKey: ["branches", shopid],
    queryFn: () => getBranches(shopid as string),
  });
  const branches =
    branchesQuery.data?.data.filter((branch) => branch.is_active) ?? [];

  const isCurrentShop = Boolean(shopid) && storedShopId === shopid;
  // A stored pickup branch that's no longer offered counts as no selection.
  const isPickupBranchGone =
    storedServiceType === "PICKUP" &&
    branchesQuery.isSuccess &&
    !branches.some((branch) => branch.id === storedBranchId);
  const serviceType =
    isCurrentShop && !isPickupBranchGone ? storedServiceType : null;
  const isDelivery = serviceType === "DELIVERY";

  // Same key/fn as the order page's nearest-branch query, so they share cache.
  const nearestBranchQuery = useQuery({
    enabled:
      hasShopId && isDelivery && Boolean(latitude) && Boolean(longitude),
    queryKey: ["nearest-branch", shopid, latitude, longitude],
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
  // The nearest-branch response carries no branch name (confirmed live), so
  // the name comes from the branch list.
  const branch = branches.find((item) => item.id === branchId) ?? null;

  // A usable choice for checkout: pickup needs its branch, delivery needs an
  // address.
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
