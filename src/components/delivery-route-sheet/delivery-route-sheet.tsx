"use client";

import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, House, MapPinned, Store } from "lucide-react";
import { useTranslations } from "next-intl";
import { Map, YMaps } from "react-yandex-maps";

import Button from "@/components/ui/button";
import ModalScreen from "@/components/modal/screen-modal";
import { DEFAULT_CENTER, YANDEX_KEYS, YANDEX_LANG } from "@/constants/yandex";
import { getBranchLabel, getShortAddress } from "@/utils/address";
import { requestYandexGeocode } from "@/utils/yandex";
import { buildBranchPinHref } from "@/utils/branch-pin";
import type { BranchProps } from "@/types/branch";
import type {
  BranchMapInstance,
  BranchYMapsApi,
  Coordinates,
} from "@/types/yandex";

const PIN_SIZE = 44;

// Not modeled in src/types/yandex.ts — that file only covers the single-
// marker Placemark case. templateLayoutFactory isn't typed by
// react-yandex-maps either, so this stays a narrow local extension, same
// approach as useBranchMapPicker.ts's own PlacemarkInstance type.
type DeliveryMapApi = BranchYMapsApi & {
  templateLayoutFactory: {
    createClass: (template: string) => unknown;
  };
};

type DeliveryMapInstance = BranchMapInstance & {
  geoObjects: BranchMapInstance["geoObjects"] & {
    remove: (object: unknown) => void;
  };
  setBounds: (
    bounds: [Coordinates, Coordinates],
    options?: { checkZoomRange?: boolean; zoomMargin?: number | number[] },
  ) => void;
};

// Pixel padding around the two pins when fitting the view — keeps both
// 44px pins and the intro chips above them fully inside the rounded map
// card.
const BOUNDS_MARGIN = [PIN_SIZE + 56, 40, 40, 40];

// How long the intro chips above the two pins stay on the map. Also drives
// the .delivery-route-chip animation below, which fades them out right
// before they're removed.
const CHIP_DURATION_MS = 4000;

const MAP_OPTIONS = {
  controls: ["zoomControl"],
  suppressMapOpenBlock: true,
  yandexMapDisablePoiInteractivity: true,
  behaviors: ["drag", "dblClickZoom"],
};

const branchPoint = (branch: BranchProps): Coordinates => [
  branch.longitude,
  branch.latitude,
];

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
  const mapRef = useRef<DeliveryMapInstance | null>(null);
  const mapApiRef = useRef<DeliveryMapApi | null>(null);
  const renderedKeyRef = useRef<string | null>(null);
  const chipTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const [yandexKeyIndex, setYandexKeyIndex] = useState(0);
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

  // OrderDetail's delivery address is plain text with no lat/lng (confirmed
  // — see order.ts) — this forward-geocodes it the same way the location
  // modal's own address search already does (src/utils/yandex.ts), instead
  // of inventing a backend coordinate field that doesn't exist. staleTime:
  // Infinity — a fixed order's address text never changes while this sheet
  // is open, so there's nothing to ever refetch; without this, a background
  // refetch (e.g. on window refocus) hands back a new `data` object for the
  // same coordinates, which was one source of the route being torn down and
  // rebuilt (and re-panned) more than once after the first settle.
  const geocodeQuery = useQuery({
    enabled: open && Boolean(address) && Boolean(branch),
    queryKey: [
      "order-detail-address-geocode",
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
          // Confirmed live (see delivery-route-sheet debugging notes): a
          // bare street/block address with no city name — exactly what
          // OrderDetail.address often is — can match a same-named street in
          // a completely different city/region ahead of the correct one in
          // Yandex's own ranking (verified: for one real address this put
          // a street 400km away, in a different province, as the #1
          // result, with the correct Tashkent match ranked 7th). `ll`
          // (search center) + `spn` (search span) + `rspn=1` (restrict
          // results to that span) biases/limits the geocoder to the area
          // around the fulfilling branch, which is where a real delivery
          // address has to be. spn 0.5° is a generous ~50km radius at this
          // latitude — comfortably covering any real delivery distance
          // without being wide enough to admit another city.
          ll: `${branch?.longitude},${branch?.latitude}`,
          spn: "0.5,0.5",
          rspn: "1",
        },
        keyIndex: yandexKeyIndex,
        setKeyIndex: setYandexKeyIndex,
      }),
    staleTime: Infinity,
    // requestYandexGeocode already cycles through every configured API key
    // itself before throwing — a failure here means every key was rejected
    // or the address genuinely can't be geocoded, neither of which a query
    // retry fixes. Default retry:3 was tripling that already-exhaustive
    // per-key loop for no benefit, just extra background network activity
    // while this sheet is open.
    retry: false,
  });

  const customerPoint = useMemo<Coordinates | null>(() => {
    const pos = geocodeQuery.data?.response?.GeoObjectCollection
      ?.featureMember?.[0]?.GeoObject?.Point?.pos
      ?.split(" ")
      .map(Number);

    return pos && pos.length >= 2 ? [pos[0], pos[1]] : null;
  }, [geocodeQuery.data]);

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
        balloonContentHeader: t("orders.detail.delivery_address"),
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
      { point: origin, text: t("orders.route.chip_branch") },
      { point: customerPoint, text: t("orders.detail.delivery_address") },
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

  const openInMaps = () => {
    if (!branch) return;

    const origin = branchPoint(branch);
    const url = customerPoint
      ? `https://yandex.uz/maps/?rtext=${origin[1]},${origin[0]}~${customerPoint[1]},${customerPoint[0]}&rtt=auto`
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
            {t("orders.route.title")}
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
                  {t("orders.route.from")}
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
                  {t("orders.route.to")}
                </p>
                {/* One line only: the short form (country/city dropped),
                    ellipsized if it's still too long — the full geocoded
                    text wrapped to 2-3 lines here. */}
                <p className="truncate text-sm text-gray220">
                  {address ? getShortAddress(address) : t("orders.route.address_missing")}
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
              .delivery-route-map [class*="controls-pane"],
              .delivery-route-map [class*="controls__toolbar"],
              .delivery-route-map [class*="float-button"],
              .delivery-route-map [class*="search"],
              .delivery-route-map [class*="traffic"],
              .delivery-route-map [class*="type-selector"],
              .delivery-route-map [class*="fullscreen"],
              .delivery-route-map [class*="ruler"],
              .delivery-route-map [class*="geolocation"],
              .delivery-route-map [class*="copyright"],
              .delivery-route-map [class*="gototech"],
              .delivery-route-map [class*="gotoymaps"],
              .delivery-route-map [class*="scale"] {
                display: none !important;
              }

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
            {t("orders.route.open_in_maps")}
          </button>
        </div>
      </div>
    </ModalScreen>
  );
};

export default memo(DeliveryRouteSheet);
