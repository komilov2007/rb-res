"use client";

import { useCallback, useMemo, useRef, useState } from "react";

import type { BranchProps } from "@/types/branch";
import type { BranchMapInstance, BranchYMapsApi } from "@/types/yandex";
import { buildBranchPinHref } from "@/utils/branch-pin";

const PIN_SIZE = 44;

export const MAP_OPTIONS = {
  controls: ["zoomControl"],
  suppressMapOpenBlock: true,
  yandexMapDisablePoiInteractivity: true,
  behaviors: ["drag", "dblClickZoom"],
};

export const useBranchInfoMap = (open: boolean, branch: BranchProps | null) => {
  const mapRef = useRef<BranchMapInstance | null>(null);
  const mapApiRef = useRef<BranchYMapsApi | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const [prevOpen, setPrevOpen] = useState(open);

  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) setIsMapReady(false);
  }

  const center = useMemo<[number, number]>(
    () => [branch?.longitude ?? 0, branch?.latitude ?? 0],
    [branch?.longitude, branch?.latitude],
  );

  const renderPlacemark = useCallback((currentBranch: BranchProps) => {
    const mapInstance = mapRef.current;
    const api = mapApiRef.current;

    if (!mapInstance || !api) return;

    const placemark = new api.Placemark(
      [currentBranch.longitude, currentBranch.latitude],
      {
        balloonContentHeader: currentBranch.name,
        balloonContentBody: currentBranch.address,
      },
      {
        iconLayout: "default#image",
        iconImageHref: buildBranchPinHref("store", PIN_SIZE),
        iconImageSize: [PIN_SIZE, PIN_SIZE],
        iconImageOffset: [-PIN_SIZE / 2, -PIN_SIZE],
      },
    );

    mapInstance.geoObjects.removeAll();
    mapInstance.geoObjects.add(placemark);
  }, []);

  const handleMapLoad = useCallback(
    (api: unknown) => {
      mapApiRef.current = api as BranchYMapsApi;
      setIsMapReady(true);
      if (branch) renderPlacemark(branch);
    },
    [branch, renderPlacemark],
  );

  const handleMapInstance = useCallback(
    (instance: unknown) => {
      mapRef.current = (instance as BranchMapInstance | null) ?? null;
      if (branch) renderPlacemark(branch);
    },
    [branch, renderPlacemark],
  );

  return { isMapReady, center, handleMapLoad, handleMapInstance };
};
