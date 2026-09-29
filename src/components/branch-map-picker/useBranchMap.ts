"use client";

import { useCallback, useEffect, useRef } from "react";

import type { BranchProps } from "@/types/branch";
import type { BranchMapInstance, BranchYMapsApi } from "@/types/yandex";

import { drawBranchPlacemarks, type PlacemarkInstance } from "./utils";

type BranchClickHandler = (branch: BranchProps, index: number) => void;

// The Yandex map itself for useBranchMapPicker: its api/instance refs, the
// imperative pin drawing and the <Map> onLoad/instanceRef handlers.
// `onReady` runs whenever the api or a genuinely new map instance arrives.
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

  // Placemarks are added imperatively (geoObjects.add), the same pattern
  // src/app/[page]/components/header/header.tsx's renderBranchPlacemark
  // already uses for the single-branch desktop dialog — not react-yandex-
  // maps' declarative <Placemark> children, which rebuilds every marker on
  // any unrelated re-render (the children array reference changes) and,
  // combined with React Strict Mode's dev-mode double-invoke, can corrupt
  // the icon. Managing add/remove explicitly here sidesteps both.
  // Takes the click handler as a parameter (rather than closing over
  // selectBranch directly) so this can be defined before selectBranch
  // without a circular reference between the two.
  const renderPlacemarks = useCallback(
    (
      branchesToRender: BranchProps[],
      currentActiveId: number | null,
      onBranchClick: BranchClickHandler,
    ): PlacemarkInstance | null => {
      const mapInstance = mapInstanceRef.current;
      const api = mapApiRef.current;

      if (!mapInstance || !api) return null;

      // Returned so highlightBranch can open the active pin's balloon.
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

  // Called from both <Map>'s onLoad (api becomes available) and
  // instanceRef (map instance becomes available) — matching
  // branch-dialog.tsx's exact dual-call-site pattern, since either one can
  // resolve first.
  const handleMapLoad = (api: unknown) => {
    mapApiRef.current = api as BranchYMapsApi;
    onReady();
  };

  const handleMapInstance = (instance: unknown) => {
    const next = (instance as BranchMapInstance | null) ?? null;
    mapInstanceRef.current = next;

    // This handler is a new function every render, so react-yandex-maps
    // re-calls it (null, then the SAME map) on every re-render. Redrawing the
    // pins then would destroy a balloon highlightBranch just opened, so only
    // a genuinely new map instance gets its pins drawn here.
    if (!next || next === lastMapInstanceRef.current) return;

    // Strict Mode's dev double-mount leaves the first map react-yandex-maps
    // built still in the DOM, stacked on top of the live one — so every pan
    // and balloon went to a map hidden under it. Destroy a previous map that
    // is still attached; a normally unmounted one is already detached.
    const previous = lastMapInstanceRef.current;

    if (previous?.container.getElement().isConnected) previous.destroy();

    lastMapInstanceRef.current = next;
    onReady();
  };

  return { mapInstanceRef, renderPlacemarks, handleMapLoad, handleMapInstance };
};

// renderPlacemarks only ever runs from the map's own onLoad/instanceRef
// and from an explicit pin tap / card swipe. When the branch list resolves
// *after* the map instance already did — the usual async order — none of
// those fire, so the map keeps whatever pin set existed at load time
// (often none). This re-runs it whenever the set itself changes.
// activeId is read through a ref rather than being a dependency: the
// highlight is already redrawn synchronously by highlightBranch and
// handleSlideChange, so depending on it here would rebuild every pin twice
// per selection on mobile.
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

  // Written in an effect, not during render — the React Compiler lint rule
  // forbids touching a ref while rendering. Declared before the effect below
  // so it has committed the fresh values by the time that one runs.
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

    // Same reason the open-transition block fits the bounds: without this
    // the pins appear but the view is still on DEFAULT_CENTER, leaving
    // several branches off-screen — which reads as the very same bug.
    // Guarded on "nothing highlighted yet" so it never yanks the view away
    // from a branch the user already picked.
    if (currentId === null && activeBranches.length > 0) {
      fitOverview();
    }

    renderPlacemarks(activeBranches, currentId, (branch) => onPinClick(branch));
  }, [open, activeBranches, renderPlacemarks]);
};
