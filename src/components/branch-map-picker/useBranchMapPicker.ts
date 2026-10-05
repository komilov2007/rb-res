"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Swiper as SwiperClass } from "swiper";

import { useBoolean } from "@/hooks/useBoolean";
import { DEFAULT_CENTER } from "@/constants/yandex";
import type { BranchProps } from "@/types/branch";

import { useBranchMapInstance, useRedrawBranchPins } from "./useBranchMap";
import { branchCenter, getDefaultOverview, type MapViewState } from "./utils";

type UseBranchMapPickerProps = {
  branches?: BranchProps[];
  value: number | null;
  onSelect: (branchId: number) => void;
  open: boolean;
  onClose: () => void;
  balloons?: boolean;
};

export const useBranchMapPicker = ({
  branches,
  value,
  onSelect,
  open,
  onClose,
  balloons = false,
}: UseBranchMapPickerProps) => {
  const list = useBoolean();
  const swiperRef = useRef<SwiperClass | null>(null);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [mapState, setMapState] = useState<MapViewState>({
    center: DEFAULT_CENTER,
    zoom: 13,
  });
  const [prevOpen, setPrevOpen] = useState(open);

  const activeBranches = useMemo(
    () => branches?.filter((branch) => branch.is_active) ?? [],
    [branches],
  );

  const { mapInstanceRef, renderPlacemarks, handleMapLoad, handleMapInstance } =
    useBranchMapInstance({ balloons, onReady: () => handleMapReady() });

  const openList = () => list.setTrue();
  const closeList = () => list.setFalse();

  const highlightBranch = (branch: BranchProps) => {
    setActiveId(branch.id);
    const placemark = renderPlacemarks(activeBranches, branch.id, selectBranch);
    const mapInstance = mapInstanceRef.current;

    if (!mapInstance) {
      setMapState({ center: branchCenter(branch), zoom: 15 });
      return;
    }

    const openBalloon = () => {
      if (balloons && placemark) placemark.balloon.open();
    };

    mapInstance
      .setCenter(branchCenter(branch), 15, { duration: 300 })
      .then(openBalloon, openBalloon);
  };

  const selectBranch = (branch: BranchProps) => {
    highlightBranch(branch);

    if (!list.value) {
      list.setTrue();
    }
  };

  if (open !== prevOpen) {
    setPrevOpen(open);

    if (open) {
      const initialBranch =
        activeBranches.find((branch) => branch.id === value) ?? null;

      setActiveId(initialBranch ? initialBranch.id : null);
      setMapState(getDefaultOverview(activeBranches));
    } else {
      list.setFalse();
    }
  }

  const handleSlideChange = (swiper: SwiperClass) => {
    const branch = activeBranches[swiper.activeIndex];

    if (!branch || branch.id === activeId) return;

    setActiveId(branch.id);
    setMapState({ center: branchCenter(branch), zoom: 15 });
    renderPlacemarks(activeBranches, branch.id, selectBranch);
  };

  useEffect(() => {
    if (!list.value || activeId === null) return;

    const index = activeBranches.findIndex((branch) => branch.id === activeId);

    if (index >= 0) {
      swiperRef.current?.slideTo(index);
    }
  }, [list.value, activeId, activeBranches]);

  const chooseBranch = (branch: BranchProps) => {
    onSelect(branch.id);
    onClose();
  };

  const handleMapReady = () => {
    renderPlacemarks(activeBranches, activeId, selectBranch);
  };

  useRedrawBranchPins({
    open,
    activeBranches,
    activeId,
    selectBranch,
    renderPlacemarks,
    showOverview: () => setMapState(getDefaultOverview(activeBranches)),
  });

  return {
    list,
    swiperRef,
    activeId,
    activeBranches,
    mapState,
    openList,
    closeList,
    highlightBranch,
    handleSlideChange,
    chooseBranch,
    handleMapLoad,
    handleMapInstance,
  };
};

export type BranchMapPickerController = ReturnType<typeof useBranchMapPicker>;
