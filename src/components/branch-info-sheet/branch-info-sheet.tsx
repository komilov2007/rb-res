"use client";

import { memo } from "react";
import { ChevronLeft, MapPinned, Store, X } from "lucide-react";
import { IconPhoneFilled } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { Map, YMaps } from "react-yandex-maps";

import Button from "@/components/ui/button";
import ModalScreen from "@/components/modal/screen-modal";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { YANDEX_KEYS, YANDEX_LANG } from "@/constants/yandex";
import type { BranchProps } from "@/types/branch";
import type { GeneralProps } from "@/types/general";
import { openBranchDirections } from "@/utils/directions";

import BranchSchedule from "@/components/branch-schedule";
import { MAP_OPTIONS, useBranchInfoMap } from "./useBranchInfoMap";

type BranchInfoSheetProps = {
  open: boolean;
  onClose: () => void;
  branch: BranchProps | null;
  workingTime?: GeneralProps["working_time"];
  // Desktop presentation. "screen" (default): the same full-screen modal as
  // mobile. "drawer": a panel sliding in from the right (profile "Biz
  // haqimizda" branches). Mobile is always the full-screen modal.
  desktop?: "screen" | "drawer";
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
  desktop = "screen",
}: BranchInfoSheetProps) => {
  const t = useTranslations();
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const isDrawer = desktop === "drawer" && isDesktop;
  const { isMapReady, center, handleMapLoad, handleMapInstance } =
    useBranchInfoMap(open, branch);

  if (!open || !branch) return null;

  const panel = (
    <div
      className={`flex ${isDrawer ? "h-full" : "h-dvh"} w-full flex-col overflow-hidden bg-white`}
    >
      <div className="z-10 flex shrink-0 items-center gap-3 border-b border-gray180 bg-white px-4 py-4">
        <Button
          type="button"
          variant="plain"
          size="none"
          onClick={onClose}
          aria-label={isDrawer ? t("common_close") : t("common_back")}
          className="text-black"
        >
          {isDrawer ? <X size={20} /> : <ChevronLeft size={22} />}
        </Button>
        <h1 className="text-base font-medium text-black">
          {t("orders_branch_info_title")}
        </h1>
      </div>

      {/* No scrolling here: the info block keeps its natural height and
          the map takes whatever is left, so the whole sheet always fits
          one screen — a longer info block just makes the map shorter. */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="shrink-0 bg-white px-4 pb-4 pt-3">
          <div className="flex items-start gap-2">
            <Store size={16} className="mt-0.5 shrink-0 text-gray220" />
            <p className="info-label">{branch.name}</p>
          </div>
          <p className="info-value pl-6">{branch.address}</p>
          {branch.phone && (
            <a
              href={`tel:${branch.phone}`}
              className="mt-1 flex items-center gap-2 pl-6"
            >
              <IconPhoneFilled size={14} className="shrink-0 text-gray220" />
              <span className="text-[13px] font-medium text-gray220/70">
                {branch.phone}
              </span>
            </a>
          )}

          <hr className="my-3 border-gray180" />

          <BranchSchedule workingTime={workingTime} />
        </div>

        {/* Same hidden-chrome technique (and the same ToS caveat) as
            src/app/[page]/components/banner/banner.tsx's own branch
            dialog, src/components/modal/location-modal/components/
            location-map.tsx, and
            src/components/branch-map-picker/branch-map-picker.tsx. */}
        <div className="branch-info-map relative mx-4 mb-2.5 mt-3 min-h-0 flex-1 overflow-hidden rounded-2xl bg-white">

          {/* Shimmer skeleton until the Yandex script has actually loaded
              and constructed the map (onLoad), which can take a beat on a
              slow connection. */}
          {!isMapReady && (
            <div className="skeleton absolute inset-0 z-10" />
          )}

          <YMaps
            query={{
              load: "Map,Placemark,geoObject.addon.balloon",
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
          className="flex h-11 w-full items-center justify-center gap-1.5 rounded-full bg-primary px-3 text-sm font-medium text-white"
        >
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
            <MapPinned size={14} strokeWidth={2.4} />
          </span>
          {t("orders_branch_info_go_to_address")}
        </button>
      </div>
    </div>
  );

  if (isDrawer) {
    return (
      <Sheet open onOpenChange={(next) => !next && onClose()}>
        <SheetContent
          side="right"
          showCloseButton={false}
          aria-describedby={undefined}
          className="w-[480px] max-w-[480px] gap-0 border-l border-gray180 p-0 sm:max-w-[480px]"
        >
          <SheetTitle className="sr-only">
            {t("orders_branch_info_title")}
          </SheetTitle>
          {panel}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <ModalScreen onClose={onClose} placement="screen" className="gap-0 !p-0">
      {panel}
    </ModalScreen>
  );
};

export default memo(BranchInfoSheet);
