"use client";

import { memo, useCallback, useMemo, useRef, useState } from "react";
import { ChevronLeft, MapPinned, Phone, Store } from "lucide-react";
import { useTranslations } from "next-intl";
import { Map, YMaps } from "react-yandex-maps";

import Button from "@/components/ui/button";
import ModalScreen from "@/components/modal/screen-modal";
import { WEEKDAYS } from "@/constants/weekdays";
import { YANDEX_KEYS, YANDEX_LANG } from "@/constants/yandex";
import type { BranchProps } from "@/types/branch";
import type { GeneralProps } from "@/types/general";
import type { BranchMapInstance, BranchYMapsApi } from "@/types/yandex";
import { buildBranchPinHref } from "@/utils/branch-pin";

// Pin size in px — offset is derived from it ([-half, -full], the icon's
// bottom point anchored at the coordinate).
const PIN_SIZE = 44;

const formatTime = (time: string) => time.slice(0, 5);

// Monday=1..Sunday=7, matching WEEKDAYS' own order — same conversion
// src/utils/banner.ts already uses for "today's hours" elsewhere in the app.
const getTodayIndex = () => new Date().getDay() || 7;

// A static, view-only single-pin map has no use for POI hover/click
// handling or multi-touch rotate — both are real CPU cost on every pointer
// move over the map (Yandex hit-tests every visible POI icon for
// yandexMapDisablePoiInteractivity, and multiTouch tracks rotation/tilt
// gestures), which is what was making this feel like it was hanging on
// weaker phones. Keeping only drag + double-click zoom is enough for
// "look at this branch, then tap Manzilga borish".
const MAP_OPTIONS = {
  controls: ["zoomControl"],
  suppressMapOpenBlock: true,
  yandexMapDisablePoiInteractivity: true,
  behaviors: ["drag", "dblClickZoom"],
};

// Same "open device navigation to this branch" flow as the home page's own
// branch dialog (src/app/[page]/components/banner/banner.tsx's
// openBranchDirections) — routes from the device's current position when
// geolocation is available/granted, otherwise falls back to a plain
// destination link.
const openBranchDirections = (branch: BranchProps) => {
  const branchPoint = `${branch.latitude},${branch.longitude}`;
  const fallbackUrl = `https://yandex.uz/maps/?rtext=~${branchPoint}&rtt=auto`;

  if (!navigator.geolocation) {
    window.open(fallbackUrl, "_blank", "noopener,noreferrer");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    ({ coords }) => {
      const userPoint = `${coords.latitude},${coords.longitude}`;

      window.open(
        `https://yandex.uz/maps/?rtext=${userPoint}~${branchPoint}&rtt=auto`,
        "_blank",
        "noopener,noreferrer",
      );
    },
    () => window.open(fallbackUrl, "_blank", "noopener,noreferrer"),
    { enableHighAccuracy: true, timeout: 5000, maximumAge: 60000 },
  );
};

type BranchInfoSheetProps = {
  open: boolean;
  onClose: () => void;
  branch: BranchProps | null;
  workingTime?: GeneralProps["working_time"];
};

// Read-only branch info + map, shared by the order page's own "Filialni
// ko'rish" (src/app/order/components/branches) and the order-detail
// sections' branch row (src/components/order-detail-sections) — both just
// want to show where a branch is with a "open in maps" action, not the
// map+card *picker* (BranchMapPicker), which has other branches to choose
// from and a "Bu yerdan olaman" pick action neither of these apply here.
//
// memo + useCallback below: a form-heavy parent (the order page's own
// re-renders fairly often — react-hook-form's useWatch, several queries),
// and without these, every one of those re-renders was handing the Yandex
// <Map> brand-new onLoad/instanceRef closures — React calls the old ref with
// null and the new one with the instance on every such change, which re-ran
// renderPlacemark (a geoObjects.removeAll()+add() pair) each time. On a
// large, already-loaded map that repeated work is what read as "stuck".
// Stable callbacks + skipping re-renders when this sheet's own props
// haven't actually changed removes that churn entirely.
const BranchInfoSheet = ({
  open,
  onClose,
  branch,
  workingTime,
}: BranchInfoSheetProps) => {
  const t = useTranslations();
  const mapRef = useRef<BranchMapInstance | null>(null);
  const mapApiRef = useRef<BranchYMapsApi | null>(null);
  const todayIndex = getTodayIndex();
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
          <h1 className="text-base font-extrabold text-black">
            {t("orders.branch_info.title")}
          </h1>
        </div>

        <div className="scroll-hidden min-h-0 flex-1 overflow-y-auto">
          <div className="bg-white px-4 pb-4 pt-3">
            <div className="flex items-start gap-2">
              <Store size={16} className="mt-0.5 shrink-0 text-gray220" />
              <p className="text-sm font-bold text-black">{branch.name}</p>
            </div>
            <p className="mt-1 pl-6 text-sm font-medium text-gray220">
              {branch.address}
            </p>
            {branch.phone && (
              <a
                href={`tel:${branch.phone}`}
                className="mt-1 flex items-center gap-2 pl-6 text-sm font-medium text-black"
              >
                <Phone size={14} className="shrink-0 text-gray220" />
                {branch.phone}
              </a>
            )}

            <hr className="my-3 border-gray180" />

            <div>
              <p className="text-xs font-bold text-black">{t("orders.branch_info.schedule")}</p>
              <ul className="mt-1.5 flex flex-col gap-1">
                {WEEKDAYS.map((day, index) => {
                  const dayNumber = index + 1;
                  const entry = workingTime?.[String(dayNumber)];
                  const isClosed =
                    !entry || entry.is_closed || entry.hours.length === 0;
                  const isToday = dayNumber === todayIndex;

                  return (
                    <li
                      key={day}
                      className={`flex items-start justify-between gap-3 text-xs ${
                        isToday
                          ? "font-bold text-primary"
                          : "font-medium text-gray220"
                      }`}
                    >
                      <span className="shrink-0">
                        {t(`weekdays.${dayNumber}`)}
                        {isToday && ` (${t("common.today")})`}:
                      </span>
                      {isClosed ? (
                        <span>—</span>
                      ) : (
                        <span
                          className={`text-right ${isToday ? "" : "text-black"}`}
                        >
                          {entry.hours.map((hour, hourIndex) => (
                            <span key={hourIndex} className="block">
                              {formatTime(hour.open)} - {formatTime(hour.close)}
                            </span>
                          ))}
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          {/* Same hidden-chrome technique (and the same ToS caveat) as
              src/app/[page]/components/banner/banner.tsx's own branch
              dialog, src/components/modal/location-modal/components/
              location-map.tsx, and
              src/components/branch-map-picker/branch-map-picker.tsx. */}
          <div className="branch-info-map relative mx-4 mt-3 h-[65dvh] min-h-96 overflow-hidden rounded-2xl bg-white">
            <style jsx global>{`
              .branch-info-map [class*="controls-pane"],
              .branch-info-map [class*="controls__toolbar"],
              .branch-info-map [class*="float-button"],
              .branch-info-map [class*="search"],
              .branch-info-map [class*="traffic"],
              .branch-info-map [class*="type-selector"],
              .branch-info-map [class*="fullscreen"],
              .branch-info-map [class*="ruler"],
              .branch-info-map [class*="geolocation"],
              .branch-info-map [class*="copyright"],
              .branch-info-map [class*="gototech"],
              .branch-info-map [class*="gotoymaps"],
              .branch-info-map [class*="scale"] {
                display: none !important;
              }
            `}</style>

            {/* Same animate-pulse skeleton style Branches' own loading
                state already uses — shown until the Yandex script has
                actually loaded and constructed the map (onLoad), which can
                take a beat on a slow connection. */}
            {!isMapReady && (
              <div className="absolute inset-0 z-10 animate-pulse bg-gray10" />
            )}

            <YMaps
              query={{
                load: "Map,Placemark",
                // @ts-expect-error react-yandex-maps types do not include Uzbek, but Yandex accepts it.
                lang: YANDEX_LANG,
                coordorder: "longlat",
                apikey: YANDEX_KEYS[0],
              }}
            >
              <Map
                onLoad={handleMapLoad}
                instanceRef={handleMapInstance}
                state={{
                  center,
                  zoom: 16,
                }}
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
            onClick={() => openBranchDirections(branch)}
            className="flex h-11 w-full items-center justify-center gap-1.5 rounded-full bg-primary px-3 text-sm font-bold text-white"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
              <MapPinned size={14} strokeWidth={2.4} />
            </span>
            {t("orders.branch_info.go_to_address")}
          </button>
        </div>
      </div>
    </ModalScreen>
  );
};

export default memo(BranchInfoSheet);
