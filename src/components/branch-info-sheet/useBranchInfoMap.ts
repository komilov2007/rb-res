"use client";

import { useCallback, useMemo, useRef, useState } from "react";

import type { BranchProps } from "@/types/branch";
import type { BranchMapInstance, BranchYMapsApi } from "@/types/yandex";
import { buildBranchPinHref } from "@/utils/branch-pin";

// Pin size in px — offset is derived from it ([-half, -full], the icon's
// bottom point anchored at the coordinate).
const PIN_SIZE = 44;

// A static, view-only single-pin map has no use for POI hover/click
// handling or multi-touch rotate — both are real CPU cost on every pointer
// move over the map (Yandex hit-tests every visible POI icon for
// yandexMapDisablePoiInteractivity, and multiTouch tracks rotation/tilt
// gestures), which is what was making this feel like it was hanging on
// weaker phones. Keeping only drag + double-click zoom is enough for
// "look at this branch, then tap Manzilga borish".
export const MAP_OPTIONS = {
  controls: ["zoomControl"],
  suppressMapOpenBlock: true,
  yandexMapDisablePoiInteractivity: true,
  behaviors: ["drag", "dblClickZoom"],
};

// The sheet's single-branch Yandex map: readiness flag, stable centre and
// stable onLoad/instanceRef callbacks (see BranchInfoSheet's memo note).
export const useBranchInfoMap = (open: boolean, branch: BranchProps | null) => {
  const mapRef = useRef<BranchMapInstance | null>(null);
  const mapApiRef = useRef<BranchYMapsApi | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  // This component never actually unmounts between opens (its caller always
  // renders it, just with open toggling), needing a fresh isMapReady each
  // time. Adjusted during render (React's documented pattern for this,
  // comparing against a previous-value snapshot) rather than in a
  // useEffect, which would cost an extra commit for what's just a plain
  // reset.
  const [prevOpen, setPrevOpen] = useState(open);

  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) setIsMapReady(false);
  }

  // react-yandex-maps' <Map> compares its `state` prop's center/zoom
  // against the previous render's *by reference* (confirmed by reading its
  // installed source), and calls map.setCenter whenever they differ. An
  // inline `[branch.longitude, branch.latitude]` array literal is a new
  // reference every render, so any unrelated re-render of this sheet was
  // forcing the map to snap back to the branch's position, overriding
  // whatever pan/zoom the user had just done — read as the map "fighting"
  // touch input. Memoizing on the actual coordinates fixes it.
  const center = useMemo<[number, number]>(
    () => [branch?.longitude ?? 0, branch?.latitude ?? 0],
    [branch?.longitude, branch?.latitude],
  );

  const renderPlacemark = useCallback((currentBranch: BranchProps) => {
    const mapInstance = mapRef.current;
    const api = mapApiRef.current;

    if (!mapInstance || !api) return;

    // "store", matching the branch icon everywhere else in the app (each
    // card in BranchMapPicker, the header chip's own pickup icon) — a plain
    // map pin doesn't say "this is a branch" the way that glyph does.
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
