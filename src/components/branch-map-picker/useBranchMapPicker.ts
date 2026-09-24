"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Swiper as SwiperClass } from "swiper";

import { useBoolean } from "@/hooks/useBoolean";
import { DEFAULT_CENTER } from "@/constants/yandex";
import type { BranchProps } from "@/types/branch";
import type { BranchMapInstance, BranchYMapsApi } from "@/types/yandex";

import {
  branchCenter,
  buildBranchBalloonHtml,
  buildPinHref,
  getDefaultOverview,
  type MapViewState,
  type PlacemarkInstance,
} from "./utils";

type UseBranchMapPickerProps = {
  branches?: BranchProps[];
  value: number | null;
  onSelect: (branchId: number) => void;
  // Controlled like the app's Dialog/Sheet primitives — the trigger (a card
  // button on the order page, a list row in the header's branch selector)
  // lives outside this hook/component, so open state is owned by the caller.
  open: boolean;
  onClose: () => void;
  // Desktop drawer only: tapping a pin also opens Yandex's balloon above it
  // with the branch name and address. Off on mobile, where the map is the
  // whole screen and the tapped branch's card already slides in underneath —
  // a balloon there would just cover the map (the same call
  // useDeliveryRouteMap documents for its own pins).
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
  const mapInstanceRef = useRef<BranchMapInstance | null>(null);
  const mapApiRef = useRef<BranchYMapsApi | null>(null);
  const lastMapInstanceRef = useRef<BranchMapInstance | null>(null);
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
    ): PlacemarkInstance | null => {
      const mapInstance = mapInstanceRef.current;
      const api = mapApiRef.current;

      if (!mapInstance || !api) return null;

      mapInstance.geoObjects.removeAll();

      // Returned so highlightBranch can open the active pin's balloon.
      let activePlacemark: PlacemarkInstance | null = null;

      branchesToRender.forEach((branch, index) => {
        const isActivePin = branch.id === currentActiveId;
        const placemark = new api.Placemark(
          [branch.longitude, branch.latitude],
          { balloonContentBody: buildBranchBalloonHtml(branch) },
          {
            iconLayout: "default#image",
            iconImageHref: buildPinHref(isActivePin),
            iconImageSize: isActivePin ? [48, 48] : [40, 40],
            iconImageOffset: isActivePin ? [-24, -48] : [-20, -40],
            // openBalloonOnClick is Yandex's default, so this only has to
            // turn it OFF where we don't want it.
            openBalloonOnClick: balloons,
            // Keep the pin drawn under its own balloon (Yandex hides it by
            // default), and never let the balloon fall back to the panel
            // layout that covers the whole map — at the drawer's width that
            // is the mode it would otherwise pick.
            hideIconOnBalloonOpen: false,
            balloonPanelMaxMapArea: 0,
            // The map is already centred on the pin; auto-panning to fit the
            // balloon would push the pin back off centre.
            balloonAutoPan: false,
            // The balloon anchors on the geometry point, which is the pin's
            // bottom tip (see iconImageOffset), so by default it opens over
            // the pin. Lift it by the pin's own height plus a few px of gap
            // to sit clear above it.
            balloonOffset: isActivePin ? [0, -56] : [0, -48],
          },
        ) as PlacemarkInstance;

        placemark.events.add("click", () => onBranchClick(branch, index));
        mapInstance.geoObjects.add(placemark);

        if (isActivePin) activePlacemark = placemark;
      });

      return activePlacemark;
    },
    [balloons],
  );

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
  // Moves the highlight and the map view, nothing else. Split out of
  // selectBranch so the desktop drawer's list rows can reuse it: a row click
  // must leave the map in exactly the state a pin click would, without
  // opening mobile's card sheet (which desktop doesn't render).
  const highlightBranch = (branch: BranchProps) => {
    setActiveId(branch.id);
    const placemark = renderPlacemarks(activeBranches, branch.id, selectBranch);
    const mapInstance = mapInstanceRef.current;

    // Map not mounted yet: let the declarative state position it once it is.
    if (!mapInstance) {
      setMapState({ center: branchCenter(branch), zoom: 15 });
      return;
    }

    // Moved imperatively, NOT through mapState: react-yandex-maps applies a
    // changed `state` with its own un-animated setZoom/setCenter on the next
    // commit, which interrupts this animation (its promise then never
    // resolves, so the balloon below never opened), and an unchanged value —
    // the same row tapped again after the user panned — doesn't move the map
    // at all. mapState stays as the open-time overview.
    const openBalloon = () => {
      // Re-rendering the pins above drops any balloon Yandex had open on the
      // old placemark, so the desktop drawer reopens it on the new one.
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

  // renderPlacemarks only ever runs from the map's own onLoad/instanceRef
  // and from an explicit pin tap / card swipe. When the branch list resolves
  // *after* the map instance already did — the usual async order — none of
  // those fire, so the map keeps whatever pin set existed at load time
  // (often none). This re-runs it whenever the set itself changes.
  // activeId is read through a ref rather than being a dependency: the
  // highlight is already redrawn synchronously by highlightBranch and
  // handleSlideChange, so depending on it here would rebuild every pin twice
  // per selection on mobile.
  const latestRef = useRef({ activeId, selectBranch });

  // Written in an effect, not during render — the React Compiler lint rule
  // forbids touching a ref while rendering. Declared before the effect below
  // so it has committed the fresh values by the time that one runs.
  useEffect(() => {
    latestRef.current = { activeId, selectBranch };
  });

  useEffect(() => {
    if (!open) return;

    const { activeId: currentId, selectBranch: onPinClick } = latestRef.current;

    // Same reason the open-transition block above fits the bounds: without
    // this the pins appear but the view is still on DEFAULT_CENTER, leaving
    // several branches off-screen — which reads as the very same bug.
    // Guarded on "nothing highlighted yet" so it never yanks the view away
    // from a branch the user already picked.
    if (currentId === null && activeBranches.length > 0) {
      setMapState(getDefaultOverview(activeBranches));
    }

    renderPlacemarks(activeBranches, currentId, (branch) => onPinClick(branch));
  }, [open, activeBranches, renderPlacemarks]);

  const handleMapLoad = (api: unknown) => {
    mapApiRef.current = api as BranchYMapsApi;
    handleMapReady();
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
    highlightBranch,
    handleSlideChange,
    chooseBranch,
    handleMapLoad,
    handleMapInstance,
  };
};

// Lets the desktop drawer take the controller as a prop, so the hook is
// still called exactly once (in branch-map-picker.tsx) and the map logic
// isn't duplicated per layout.
export type BranchMapPickerController = ReturnType<typeof useBranchMapPicker>;
