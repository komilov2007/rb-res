"use client";

import { useCallback, useEffect, useRef } from "react";

import type { BranchProps } from "@/types/branch";
import type { BranchMapInstance, BranchYMapsApi } from "@/types/yandex";

import { drawBranchPlacemarks, type PlacemarkInstance } from "./utils";

type BranchClickHandler = (branch: BranchProps, index: number) => void;

export const useBranchMapInstance = ({
  balloons,
  onReady,
}: {
  balloons: boolean;
  onReady: () => void;
}) => {
  const mapInstanceRef = useRef<BranchMapInstance | null>(null);
  const mapApiRef = useRef<BranchYMapsApi | null>(null);
  const lastMapInstanceRef = useRef<BranchMapInstance | null>(null);

  const renderPlacemarks = useCallback(
    (
      branchesToRender: BranchProps[],
      currentActiveId: number | null,
      onBranchClick: BranchClickHandler,
    ): PlacemarkInstance | null => {
      const mapInstance = mapInstanceRef.current;
      const api = mapApiRef.current;

      if (!mapInstance || !api) return null;

      return drawBranchPlacemarks({
        mapInstance,
        api,
        branches: branchesToRender,
        activeId: currentActiveId,
        balloons,
        onBranchClick,
      });
    },
    [balloons],
  );

  const handleMapLoad = (api: unknown) => {
    mapApiRef.current = api as BranchYMapsApi;
    onReady();
  };

  const handleMapInstance = (instance: unknown) => {
    const next = (instance as BranchMapInstance | null) ?? null;
    mapInstanceRef.current = next;

    if (!next || next === lastMapInstanceRef.current) return;

    const previous = lastMapInstanceRef.current;

    if (previous?.container.getElement().isConnected) previous.destroy();

    lastMapInstanceRef.current = next;
    onReady();
  };

  return { mapInstanceRef, renderPlacemarks, handleMapLoad, handleMapInstance };
};

export const useRedrawBranchPins = ({
  open,
  activeBranches,
  activeId,
  selectBranch,
  renderPlacemarks,
  showOverview,
}: {
  open: boolean;
  activeBranches: BranchProps[];
  activeId: number | null;
  selectBranch: (branch: BranchProps) => void;
  renderPlacemarks: (
    branches: BranchProps[],
    activeId: number | null,
    onBranchClick: BranchClickHandler,
  ) => PlacemarkInstance | null;
  showOverview: () => void;
}) => {
  const latestRef = useRef({ activeId, selectBranch, showOverview });

  useEffect(() => {
    latestRef.current = { activeId, selectBranch, showOverview };
  });

  useEffect(() => {
    if (!open) return;

    const {
      activeId: currentId,
      selectBranch: onPinClick,
      showOverview: fitOverview,
    } = latestRef.current;

    if (currentId === null && activeBranches.length > 0) {
      fitOverview();
    }

    renderPlacemarks(activeBranches, currentId, (branch) => onPinClick(branch));
  }, [open, activeBranches, renderPlacemarks]);
};
