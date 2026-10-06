"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";

import { DEFAULT_CENTER } from "@/constants/yandex";
import type { BranchProps } from "@/types/branch";
import type { Coordinates } from "@/types/yandex";
import { buildBranchPinHref } from "@/utils/branch-pin";

import { BOUNDS_MARGIN, CHIP_DURATION_MS, PIN_SIZE, branchPoint, type DeliveryMapApi, type DeliveryMapInstance } from "./delivery-route-sheet";
import { useCustomerPoint } from "./delivery-route-sheet";

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
  const [prevOpen, setPrevOpen] = useState(open);

  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) setIsMapReady(false);
  }

  useEffect(() => {
    if (open) renderedKeyRef.current = null;
  }, [open]);

  useEffect(
    () => () => {
      if (chipTimerRef.current) clearTimeout(chipTimerRef.current);
    },
    [],
  );

  const initialCenter = useMemo<Coordinates>(
    () => (branch ? branchPoint(branch) : DEFAULT_CENTER),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [branch?.longitude, branch?.latitude],
  );

  const customerPoint = useCustomerPoint(open, address, branch);

  const renderMarkers = useCallback(() => {
    const mapInstance = mapRef.current;
    const api = mapApiRef.current;

    if (!mapInstance || !api || !branch) return;

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
