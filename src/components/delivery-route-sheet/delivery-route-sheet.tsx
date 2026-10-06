"use client";

import type { BranchProps } from "@/types/branch";
import type { BranchMapInstance, BranchYMapsApi, Coordinates } from "@/types/yandex";
import { memo, useMemo, useState } from "react";
import { ChevronLeft, MapPinned, Store } from "lucide-react";
import { IconHomeFilled } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { Map, YMaps } from "react-yandex-maps";
import Button from "@/components/ui/button";
import ModalScreen from "@/components/modal/screen-modal";
import { YANDEX_KEYS, YANDEX_LANG } from "@/constants/yandex";
import { getBranchLabel, getShortAddress } from "@/utils/address";
import { getYandexRouteUrl } from "@/utils/directions";
import { useDeliveryRouteMap } from "./useDeliveryRouteMap";
import { useQuery } from "@tanstack/react-query";
import { requestYandexGeocode } from "@/utils/yandex";
import { REACT_QUERY_KEYS } from "@/constants/react-query-keys";

export const PIN_SIZE = 44;

export type DeliveryMapApi = BranchYMapsApi & {
  templateLayoutFactory: {
    createClass: (template: string) => unknown;
  };
};

export type DeliveryMapInstance = BranchMapInstance & {
  geoObjects: BranchMapInstance["geoObjects"] & {
    remove: (object: unknown) => void;
  };
  setBounds: (
    bounds: [Coordinates, Coordinates],
    options?: { checkZoomRange?: boolean; zoomMargin?: number | number[] },
  ) => void;
};

export const BOUNDS_MARGIN = [PIN_SIZE + 56, 40, 40, 40];

export const CHIP_DURATION_MS = 4000;

export const MAP_OPTIONS = {
  controls: ["zoomControl"],
  suppressMapOpenBlock: true,
  yandexMapDisablePoiInteractivity: true,
  behaviors: ["drag", "dblClickZoom"],
};

export const branchPoint = (branch: BranchProps): Coordinates => [
  branch.longitude,
  branch.latitude,
];

type DeliveryRouteSheetProps = {
  open: boolean;
  onClose: () => void;
  branch: BranchProps | null;
  address: string | null;
};

const DeliveryRouteSheet = ({
  open,
  onClose,
  branch,
  address,
}: DeliveryRouteSheetProps) => {
  const t = useTranslations();
  const {
    isMapReady,
    initialCenter,
    handleMapLoad,
    handleMapInstance,
    customerPoint,
  } = useDeliveryRouteMap(open, branch, address);

  const openInMaps = () => {
    if (!branch) return;

    const origin = branchPoint(branch);
    const url = customerPoint
      ? getYandexRouteUrl(
          `${customerPoint[1]},${customerPoint[0]}`,
          `${origin[1]},${origin[0]}`,
        )
      : `https://yandex.uz/maps/?pt=${origin[0]},${origin[1]}&z=16`;

    window.open(url, "_blank", "noopener,noreferrer");
  };

  if (!open || !branch) return null;

  return (
    <ModalScreen onClose={onClose} placement="screen" className="gap-0 !p-0">
      <div className="flex h-dvh w-full flex-col overflow-hidden bg-white">
        <div className="z-10 flex shrink-0 items-center gap-3 border-b border-gray180 bg-white px-4 py-4">
          <Button
            type="button"
            variant="plain"
            size="none"
            onClick={onClose}
            className="text-black"
          >
            <ChevronLeft size={22} />
          </Button>
          <h1 className="text-base font-medium text-black">
            {t("orders_route_title")}
          </h1>
        </div>

        <div className="flex min-h-0 flex-1 flex-col">
          <ol className="mx-4 mt-3 mb-3 shrink-0 rounded-2xl border border-gray180 bg-white p-3">
            <li className="flex gap-3">
              <div className="flex flex-col items-center">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-white">
                  <Store size={16} strokeWidth={2.2} />
                </span>
                <span className="my-1 w-0 flex-1 border-l-2 border-dashed border-gray180" />
              </div>
              <div className="min-w-0 flex-1 pb-4">
                <p className="text-[11px] uppercase tracking-wide text-gray220">
                  {t("orders_route_from")}
                </p>
                <p className="truncate text-sm text-black">
                  {getBranchLabel(branch.name)}
                </p>
                <p className="truncate text-xs text-gray220">
                  {branch.address}
                </p>
              </div>
            </li>

            <li className="flex gap-3">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full border-2 border-primary bg-white text-primary">
                <IconHomeFilled size={15} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] uppercase tracking-wide text-gray220">
                  {t("orders_route_to")}
                </p>
                <p className="truncate text-sm text-gray220">
                  {address ? getShortAddress(address) : t("orders_route_address_missing")}
                </p>
              </div>
            </li>
          </ol>

          <div className="delivery-route-map relative mx-4 mb-3 min-h-0 flex-1 overflow-hidden rounded-2xl bg-white">
            <style jsx global>{`
              .delivery-route-chip {
                position: absolute;
                left: 0;
                top: 0;
                transform: translate(-50%, calc(-100% - ${PIN_SIZE + 8}px));
                white-space: nowrap;
                border-radius: 9999px;
                background: #ffffff;
                padding: 6px 10px;
                font-size: 12px;
                font-weight: 500;
                color: #111111;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.18);
                pointer-events: none;
                animation: delivery-route-chip ${CHIP_DURATION_MS}ms ease
                  forwards;
              }

              .delivery-route-chip::after {
                content: "";
                position: absolute;
                left: 50%;
                bottom: -4px;
                width: 8px;
                height: 8px;
                background: #ffffff;
                transform: translateX(-50%) rotate(45deg);
              }

              @keyframes delivery-route-chip {
                0% {
                  opacity: 0;
                }
                8%,
                85% {
                  opacity: 1;
                }
                100% {
                  opacity: 0;
                }
              }
            `}</style>

            {!isMapReady && (
              <div className="skeleton absolute inset-0 z-10" />
            )}

            <YMaps
              query={{
                load: "Map,Placemark,templateLayoutFactory,geoObject.addon.balloon",
                // @ts-expect-error react-yandex-maps types do not include Uzbek, but Yandex accepts it.
                lang: YANDEX_LANG,
                coordorder: "longlat",
                apikey: YANDEX_KEYS[0],
              }}
            >
              <Map
                onLoad={handleMapLoad}
                instanceRef={handleMapInstance}
                state={{ center: initialCenter, zoom: 14 }}
                defaultOptions={MAP_OPTIONS}
                options={MAP_OPTIONS}
                className="h-full w-full"
              />
            </YMaps>
          </div>
        </div>

        <div className="shrink-0 border-t border-gray180 bg-white px-4 pb-[max(16px,env(safe-area-inset-bottom))] pt-3">
          <button
            type="button"
            onClick={openInMaps}
            className="flex h-11 w-full items-center justify-center gap-1.5 rounded-full bg-primary px-3 text-sm font-medium text-white"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
              <MapPinned size={14} strokeWidth={2.4} />
            </span>
            {t("orders_route_open_in_maps")}
          </button>
        </div>
      </div>
    </ModalScreen>
  );
};

const DeliveryRouteSheetDefault = memo(DeliveryRouteSheet);

export const useCustomerPoint = (
  open: boolean,
  address: string | null,
  branch: BranchProps | null,
) => {
  const [yandexKeyIndex, setYandexKeyIndex] = useState(0);

  const geocodeQuery = useQuery({
    enabled: open && Boolean(address) && Boolean(branch),
    queryKey: [
      REACT_QUERY_KEYS.ORDER_DETAIL_ADDRESS_GEOCODE,
      address,
      branch?.longitude,
      branch?.latitude,
    ],
    queryFn: () =>
      requestYandexGeocode({
        params: {
          format: "json",
          lang: YANDEX_LANG,
          geocode: address as string,
          ll: `${branch?.longitude},${branch?.latitude}`,
          spn: "0.5,0.5",
          rspn: "1",
        },
        keyIndex: yandexKeyIndex,
        setKeyIndex: setYandexKeyIndex,
      }),
    staleTime: Infinity,
    retry: false,
  });

  const customerPoint = useMemo<Coordinates | null>(() => {
    const pos = geocodeQuery.data?.response?.GeoObjectCollection
      ?.featureMember?.[0]?.GeoObject?.Point?.pos
      ?.split(" ")
      .map(Number);

    return pos && pos.length >= 2 ? [pos[0], pos[1]] : null;
  }, [geocodeQuery.data]);

  return customerPoint;
};

export { DeliveryRouteSheetDefault };

export default DeliveryRouteSheetDefault;
