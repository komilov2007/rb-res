"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Swiper as SwiperClass } from "swiper";

import { useBoolean } from "@/hooks/useBoolean";
import { DEFAULT_CENTER } from "@/constants/yandex";
import type { BranchProps } from "@/types/branch";
import type { BranchMapInstance, BranchYMapsApi, Coordinates } from "@/types/yandex";
import { buildBranchPinHref } from "@/utils/branch-pin";

type UseBranchMapPickerProps = {
  branches?: BranchProps[];
  value: number | null;
  onSelect: (branchId: number) => void;
  // Controlled like the app's Dialog/Sheet primitives — the trigger (a card
  // button on the order page, a list row in the header's branch selector)
  // lives outside this hook/component, so open state is owned by the caller.
  open: boolean;
  onClose: () => void;
};

type MapViewState =
  | { center: Coordinates; zoom: number }
  | { bounds: [Coordinates, Coordinates] };

// A constructed ymaps.Placemark instance — BranchYMapsApi only types the
// constructor (returns unknown), not the instance surface, so this covers
// the one extra member used here beyond what src/types/yandex.ts already
// models for the single-marker case in header.tsx/branch-dialog.tsx.
type PlacemarkInstance = {
  events: { add: (event: string, handler: () => void) => void };
};

const branchCenter = (branch: BranchProps): Coordinates => [
  branch.longitude,
  branch.latitude,
];

const branchesBounds = (
  list: BranchProps[],
): [Coordinates, Coordinates] | null => {
  if (list.length === 0) return null;

  const lngs = list.map((branch) => branch.longitude);
  const lats = list.map((branch) => branch.latitude);
  // Padding around the outermost branches so their pins (drawn above the
  // point) aren't cut off at the map's edges.
  const lngPad = Math.max((Math.max(...lngs) - Math.min(...lngs)) * 0.15, 0.005);
  const latPad = Math.max((Math.max(...lats) - Math.min(...lats)) * 0.2, 0.005);

  return [
    [Math.min(...lngs) - lngPad, Math.min(...lats) - latPad],
    [Math.max(...lngs) + lngPad, Math.max(...lats) + latPad],
  ];
};

// Every branch gets the same Store glyph (matching each branch card's own
// Store icon); the picked/active one is just drawn larger. Glyph/badge
// building itself is shared — see its own comment.
const buildPinHref = (active: boolean) =>
  buildBranchPinHref("store", active ? 48 : 40);

export const useBranchMapPicker = ({
  branches,
  value,
  onSelect,
  open,
  onClose,
}: UseBranchMapPickerProps) => {
  const list = useBoolean();
  const swiperRef = useRef<SwiperClass | null>(null);
  const mapInstanceRef = useRef<BranchMapInstance | null>(null);
  const mapApiRef = useRef<BranchYMapsApi | null>(null);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [mapState, setMapState] = useState<MapViewState>({
    center: DEFAULT_CENTER,
    zoom: 13,
  });
  // Tracks the previous `open` so the block below can tell "just became
  // visible"/"just closed" apart from every other render.
  const [prevOpen, setPrevOpen] = useState(open);

  // Inactive branches get no pin and no card — computed once so the pin
  // array and the card array stay the same list in the same order, which is
  // what keeps pin-tap <-> card-swipe index sync correct.
  const activeBranches = useMemo(
    () => branches?.filter((branch) => branch.is_active) ?? [],
    [branches],
  );

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
      onBranchClick: (branch: BranchProps, index: number) => void,
    ) => {
      const mapInstance = mapInstanceRef.current;
      const api = mapApiRef.current;

      if (!mapInstance || !api) return;

      mapInstance.geoObjects.removeAll();

      branchesToRender.forEach((branch, index) => {
        const isActivePin = branch.id === currentActiveId;
        const placemark = new api.Placemark(
          [branch.longitude, branch.latitude],
          {
            balloonContentHeader: branch.name,
            balloonContentBody: branch.address,
          },
          {
            iconLayout: "default#image",
            iconImageHref: buildPinHref(isActivePin),
            iconImageSize: isActivePin ? [48, 48] : [40, 40],
            iconImageOffset: isActivePin ? [-24, -48] : [-20, -40],
          },
        ) as PlacemarkInstance;

        placemark.events.add("click", () => onBranchClick(branch, index));
        mapInstance.geoObjects.add(placemark);
      });
    },
    [],
  );

  const defaultOverview = (): MapViewState => {
    if (activeBranches.length >= 2) {
      const bounds = branchesBounds(activeBranches);

      if (bounds) return { bounds };
    }

    const only = activeBranches[0];

    return only
      ? { center: branchCenter(only), zoom: 13 }
      : { center: DEFAULT_CENTER, zoom: 13 };
  };

  const openList = () => list.setTrue();
  const closeList = () => list.setFalse();

  // Shared by both the map-pin tap and the card-swipe selection, so either
  // interaction keeps the other in sync (pointer taps a pin -> matching card
  // slides into view; swiping a card -> its pin becomes the active one).
  // The actual scroll-into-view happens in the effect below, not here —
  // a pin tapped while the drawer is closed calls this before the Swiper
  // has even mounted (list.setTrue() below only takes effect on the next
  // render), so swiperRef.current would still be null at this point and
  // slideTo() would silently no-op.
  const selectBranch = (branch: BranchProps) => {
    setActiveId(branch.id);
    setMapState({ center: branchCenter(branch), zoom: 15 });
    renderPlacemarks(activeBranches, branch.id, selectBranch);

    if (!list.value) {
      list.setTrue();
    }
  };

  // Initializes the map view whenever this becomes visible, and resets the
  // list to collapsed whenever it closes — mirrors what a synchronous
  // "open" click handler used to do (the trigger now lives outside this
  // hook), using React's "adjust state while rendering" pattern (comparing
  // against a previous-value snapshot) instead of a useEffect, since a
  // plain effect that calls setState causes an extra, avoidable commit.
  // Placemarks are NOT rendered here — that stays purely imperative (via
  // handleMapReady, below), matching this codebase's established lesson
  // (see renderPlacemarks' own comment) that mutating the Yandex map from
  // render-time code risks corruption under Strict Mode's double-invoke.
  // Only reacts to `open` transitions — a re-select while already open
  // shouldn't reset the map view, so `value` is intentionally read fresh
  // here rather than captured as a dependency anywhere.
  if (open !== prevOpen) {
    setPrevOpen(open);

    if (open) {
      const initialBranch =
        activeBranches.find((branch) => branch.id === value) ?? null;

      // Always opens on the overview of every branch — the selected one is
      // still highlighted (larger pin), but zooming straight into it hid
      // all the others.
      setActiveId(initialBranch ? initialBranch.id : null);
      setMapState(defaultOverview());
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

  // The single place that actually moves the Swiper to match activeId —
  // covers both a pin tapped while the drawer was already open (swiperRef
  // exists immediately) and one tapped while it was closed (this only runs
  // once the drawer's re-render mounts the Swiper and list.value/swiperRef
  // are both ready). handleSlideChange updating activeId re-triggers this
  // too, but slideTo-ing to the slide that's already active is a no-op.
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

  // Called from both <Map>'s onLoad (api becomes available) and
  // instanceRef (map instance becomes available) — matching
  // branch-dialog.tsx's exact dual-call-site pattern, since either one can
  // resolve first.
  const handleMapReady = () => {
    renderPlacemarks(activeBranches, activeId, selectBranch);
  };

  const handleMapLoad = (api: unknown) => {
    mapApiRef.current = api as BranchYMapsApi;
    handleMapReady();
  };

  const handleMapInstance = (instance: unknown) => {
    mapInstanceRef.current = (instance as BranchMapInstance | null) ?? null;
    handleMapReady();
  };

  return {
    list,
    swiperRef,
    activeId,
    activeBranches,
    mapState,
    openList,
    closeList,
    handleSlideChange,
    chooseBranch,
    handleMapLoad,
    handleMapInstance,
  };
};
