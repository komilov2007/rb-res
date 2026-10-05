"use client";

import { useMemo } from "react";

import { useDeviceLocation } from "@/hooks/useDeviceLocation";
import { useLocationStore } from "@/stores/location";
import type { BranchProps } from "@/types/branch";
import { getDistanceKm } from "@/utils/distance";

export const useNearestBranches = (branches: BranchProps[]) => {
  const latitude = useLocationStore((state) => state.latitude);
  const longitude = useLocationStore((state) => state.longitude);
  const hasAddressCoords = latitude !== null && longitude !== null;
  const deviceCoords = useDeviceLocation(!hasAddressCoords);
  const origin =
    latitude !== null && longitude !== null
      ? { latitude, longitude }
      : deviceCoords;

  const sorted = useMemo(
    () =>
      branches
        .map((branch) => ({
          branch,
          km: origin ? getDistanceKm(origin, branch) : null,
        }))
        .sort((a, b) => (a.km ?? 0) - (b.km ?? 0)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [branches, origin?.latitude, origin?.longitude],
  );

  const list = useMemo(() => sorted.map((item) => item.branch), [sorted]);

  return { sorted, list };
};
