"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";

import { DEFAULT_CENTER } from "@/constants/yandex";
import type { BranchProps } from "@/types/branch";
import type { Coordinates } from "@/types/yandex";
import { buildBranchPinHref } from "@/utils/branch-pin";

import {
  BOUNDS_MARGIN,
  CHIP_DURATION_MS,
  PIN_SIZE,
  branchPoint,
  type DeliveryMapApi,
  type DeliveryMapInstance,
} from "./constants";
import { useCustomerPoint } from "./useCustomerPoint";

// Map state for the delivery route sheet: branch + customer pins, fitted
// bounds, the arrival chip, and the "open in Yandex Maps" action.
export const useDeliveryRouteMap = (
  open: boolean,
  branch: BranchProps | null,
  address: string | null,
) => {
  const t = useTranslations();
  const mapRef = useRef<DeliveryMapInstance | null>(null);
  const mapApiRef = useRef<DeliveryMapApi | null>(null);
  const renderedKeyRef = useRef<string | null>(null);
  const chipTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  // Resets isMapReady on each fresh open — same pattern as branch-info-sheet
  // (React's "adjust state during render" instead of an effect, to avoid an
  // extra commit for what's just a plain reset).
  const [prevOpen, setPrevOpen] = useState(open);

  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) setIsMapReady(false);
  }

  // The <Map>/geoObjects genuinely remount on each open (this component
  // returns null while closed, unmounting them) — renderedKeyRef must reset
  // alongside isMapReady, or renderMarkers below would wrongly think a
  // previous open's key still applies and skip rendering anything onto the
  // brand new map instance. A ref write isn't safe during render (unlike
  // the plain state adjustment above), so this is a real effect instead.
  useEffect(() => {
    if (open) renderedKeyRef.current = null;
  }, [open]);

  useEffect(
    () => () => {
      if (chipTimerRef.current) clearTimeout(chipTimerRef.current);
    },
    [],
  );

  // react-yandex-maps' <Map> compares this against its previous `state`
  // prop *by reference* on every update (confirmed by reading its installed
  // source: `state.center !== prevState.center` triggers `map.setCenter`) —
  // an inline `{ center: branchPoint(branch), zoom: 14 }` literal creates a
  // brand-new array every render, so *any* re-render of this component
  // (the geocode query settling, isMapReady flipping, anything upstream)
  // was forcing the map to snap back to the branch's original position,
  // fighting whatever pan/zoom the user had just done — this is what read
  // as the map "freezing" after 1-2 touches. Memoizing on the actual
  // coordinates keeps the array reference stable across unrelated renders,
  // so setCenter only ever fires once, at genuine mount.
  const initialCenter = useMemo<Coordinates>(
    () => (branch ? branchPoint(branch) : DEFAULT_CENTER),
    // Deliberately keyed on the coordinates, not `branch` itself — the
    // point of this memo is to stay referentially stable across renders
    // where the branch object identity changes (e.g. a query refetch) but
    // its actual lat/lng don't.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [branch?.longitude, branch?.latitude],
  );

  const customerPoint = useCustomerPoint(open, address, branch);

  // Imperative geoObjects.add/removeAll — same established reason as
  // useBranchMapPicker.ts/branch-info-sheet.tsx: the declarative
  // <Placemark> children rebuild on every unrelated re-render (a new
  // children array reference), which under Strict Mode's dev-mode
  // double-invoke can corrupt the markers.
  const renderMarkers = useCallback(() => {
    const mapInstance = mapRef.current;
    const api = mapApiRef.current;

    if (!mapInstance || !api || !branch) return;

    // handleMapLoad, handleMapInstance and the isMapReady effect below can
    // all end up calling this for the same branch/customerPoint pair —
    // skipping a call that doesn't change the rendered key keeps the pins,
    // chips and bounds from being rebuilt (and the view re-fitted) twice.
    const key = `${branch.id}:${customerPoint ? customerPoint.join(",") : "none"}`;

    if (renderedKeyRef.current === key) return;
    renderedKeyRef.current = key;

    mapInstance.geoObjects.removeAll();

    const origin = branchPoint(branch);
    const branchPlacemark = new api.Placemark(
      origin,
      { balloonContentHeader: branch.name, balloonContentBody: branch.address },
      {
        iconLayout: "default#image",
        iconImageHref: buildBranchPinHref("store", PIN_SIZE),
        iconImageSize: [PIN_SIZE, PIN_SIZE],
        iconImageOffset: [-PIN_SIZE / 2, -PIN_SIZE],
      },
    );

    mapInstance.geoObjects.add(branchPlacemark);

    if (!customerPoint) return;

    const customerPlacemark = new api.Placemark(
      customerPoint,
      {
        balloonContentHeader: t("orders_detail_delivery_address"),
        balloonContentBody: address ?? "",
      },
      {
        iconLayout: "default#image",
        iconImageHref: buildBranchPinHref("customer", PIN_SIZE),
        iconImageSize: [PIN_SIZE, PIN_SIZE],
        iconImageOffset: [-PIN_SIZE / 2, -PIN_SIZE],
      },
    );

    mapInstance.geoObjects.add(customerPlacemark);

    // Short-lived chips above each pin explaining what it is, shown once
    // per open and removed after CHIP_DURATION_MS (the CSS animation fades
    // them out first). Separate HTML-layout placemarks rather than the pins'
    // own balloons — balloons need a tap to open and cover the map. Only
    // added once both points are known, so the branch chip isn't shown twice
    // (renderMarkers first runs with the branch alone, before geocoding).
    const chips = [
      { point: origin, text: t("orders_route_chip_branch") },
      { point: customerPoint, text: t("orders_detail_delivery_address") },
    ].map(({ point, text }) => {
      const chip = new api.Placemark(
        point,
        {},
        {
          iconLayout: api.templateLayoutFactory.createClass(
            `<div class="delivery-route-chip">${text}</div>`,
          ),
          interactivityModel: "default#silent",
          zIndex: 1000,
        },
      );

      mapInstance.geoObjects.add(chip);
      return chip;
    });

    if (chipTimerRef.current) clearTimeout(chipTimerRef.current);
    chipTimerRef.current = setTimeout(() => {
      chips.forEach((chip) => mapInstance.geoObjects.remove(chip));
    }, CHIP_DURATION_MS);

    // Fit the view to the two pins. Bounds are [southWest, northEast] in
    // this map's longlat order.
    mapInstance.setBounds(
      [
        [
          Math.min(origin[0], customerPoint[0]),
          Math.min(origin[1], customerPoint[1]),
        ],
        [
          Math.max(origin[0], customerPoint[0]),
          Math.max(origin[1], customerPoint[1]),
        ],
      ],
      { checkZoomRange: true, zoomMargin: BOUNDS_MARGIN },
    );
  }, [branch, customerPoint, address, t]);

  const handleMapLoad = useCallback(
    (api: unknown) => {
      mapApiRef.current = api as DeliveryMapApi;
      setIsMapReady(true);
      renderMarkers();
    },
    [renderMarkers],
  );

  const handleMapInstance = useCallback(
    (instance: unknown) => {
      mapRef.current = (instance as DeliveryMapInstance | null) ?? null;
      renderMarkers();
    },
    [renderMarkers],
  );

  // The map itself mounts once handleMapLoad/handleMapInstance fire; the
  // customer point resolves later (the geocode query), so this re-renders
  // the markers once it does, without waiting for another map-lifecycle
  // event.
  useEffect(() => {
    if (isMapReady) renderMarkers();
  }, [isMapReady, renderMarkers]);

  return {
    isMapReady,
    initialCenter,
    handleMapLoad,
    handleMapInstance,
    customerPoint,
  };
};
