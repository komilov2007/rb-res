"use client";

import { useMemo } from "react";

import { useDeviceLocation } from "@/hooks/useDeviceLocation";
import { useLocationStore } from "@/stores/location";
import type { BranchProps } from "@/types/branch";
import { getDistanceKm } from "@/utils/distance";

// Branches nearest first (API order when no origin is known), shared by the
// pickup tab's rows and by the map picker so both list the same branches in
// the same order. Lives here, above both, because the picker is rendered by
// BranchSelectionModal — outside the tab — so that closing the modal doesn't
// unmount the open picker.
//
// Memoized: the picker derives its map pin array from this list, and a fresh
// array on every render would make it tear down and redraw every placemark
// each time.
export const useNearestBranches = (branches: BranchProps[]) => {
  const latitude = useLocationStore((state) => state.latitude);
  const longitude = useLocationStore((state) => state.longitude);
  const hasAddressCoords = latitude !== null && longitude !== null;
  // Without a saved delivery point, distances fall back to the device
  // location (silently skipped if unavailable or denied).
  const deviceCoords = useDeviceLocation(!hasAddressCoords);
  const origin =
    latitude !== null && longitude !== null
      ? { latitude, longitude }
      : deviceCoords;

  // Depends on the coordinates, not on `origin` — that's a new object
  // literal per render.
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
