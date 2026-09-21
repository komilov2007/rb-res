"use client";

import { memo } from "react";
import { ChevronLeft, House, MapPinned, Store } from "lucide-react";
import { useTranslations } from "next-intl";
import { Map, YMaps } from "react-yandex-maps";

import Button from "@/components/ui/button";
import ModalScreen from "@/components/modal/screen-modal";
import { YANDEX_KEYS, YANDEX_LANG } from "@/constants/yandex";
import { getBranchLabel, getShortAddress } from "@/utils/address";
import type { BranchProps } from "@/types/branch";

import { getYandexRouteUrl } from "@/utils/directions";

import {
  CHIP_DURATION_MS,
  MAP_OPTIONS,
  PIN_SIZE,
  branchPoint,
} from "./constants";
import { useDeliveryRouteMap } from "./useDeliveryRouteMap";
type DeliveryRouteSheetProps = {
  open: boolean;
  onClose: () => void;
  // The fulfilling branch — always known (OrderDetail.branch). The delivery
  // address has no coordinates of its own in OrderDetail, only its text, so
  // it's geocoded below rather than plotted directly.
  branch: BranchProps | null;
  address: string | null;
};

// Delivery orders' equivalent of branch-info-sheet's pickup view: instead of
// one pin (the branch you'd walk into), this shows two — where the order
// ships from and where it's going. No route line between them: Yandex's
// routing (multiRouter) is a separately limited/paid API, and the
// "open in maps" button below hands real navigation to Yandex Maps. Mounted
// from order-detail-sections.tsx only when service_type is a delivery type.
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
          {/* From → to route card. Each stop's icon badge matches its map
              pin exactly (src/utils/branch-pin.ts: filled primary store for
              the branch, white + primary ring house for the customer), so
              the card doubles as the map's legend. */}
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
                <House size={15} strokeWidth={2.2} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] uppercase tracking-wide text-gray220">
                  {t("orders_route_to")}
                </p>
                {/* One line only: the short form (country/city dropped),
                    ellipsized if it's still too long — the full geocoded
                    text wrapped to 2-3 lines here. */}
                <p className="truncate text-sm text-gray220">
                  {address ? getShortAddress(address) : t("orders_route_address_missing")}
                </p>
              </div>
            </li>
          </ol>

          {/* flex-1 (not a fixed dvh height like branch-info-sheet's own
              map) — this screen's info block above is much shorter than
              branch-info-sheet's (no working-hours table), so a fixed
              height left a large empty gap before the footer; filling the
              remaining space instead makes the map as large as branch-info-
              sheet's regardless of how tall the text above ends up being.
              Same hidden-chrome technique (and the same ToS caveat) as
              src/components/branch-info-sheet, src/components/branch-map-picker,
              and src/components/modal/location-modal/components/location-map.tsx. */}
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
                font-weight: 600;
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
              <div className="absolute inset-0 z-10 animate-pulse bg-gray10" />
            )}

            <YMaps
              query={{
                load: "Map,Placemark,templateLayoutFactory",
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
            className="flex h-11 w-full items-center justify-center gap-1.5 rounded-full bg-primary px-3 text-sm font-bold text-white"
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

export default memo(DeliveryRouteSheet);
