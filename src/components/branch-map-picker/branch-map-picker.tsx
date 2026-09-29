"use client";

import { useTranslations } from "next-intl";
import { ChevronLeft } from "lucide-react";
import { Map, YMaps } from "react-yandex-maps";
import "swiper/css";

import Button from "@/components/ui/button";
import ModalScreen from "@/components/modal/screen-modal";
import { YANDEX_KEYS, YANDEX_LANG } from "@/constants/yandex";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import type { BranchProps } from "@/types/branch";
import type { GeneralProps } from "@/types/general";

import BranchCardsSheet from "./branch-cards-sheet";
import BranchMapPickerDrawer from "./branch-map-picker-drawer";
import { useBranchMapPicker } from "./useBranchMapPicker";

type BranchMapPickerProps = {
  open: boolean;
  onClose: () => void;
  branches?: BranchProps[];
  workingTime?: GeneralProps["working_time"];
  value: number | null;
  onSelect: (branchId: number) => void;
  title?: string;
  // View-only mode: hides the "Bu yerdan olaman" pick action, for callers
  // that just want to show where a branch is (e.g. my-orders' detail page)
  // rather than let the user choose one.
  readOnly?: boolean;
  // "drawer" swaps the desktop layout for a right-side drawer (map on top,
  // schedule, then the full branch list) instead of the centered ModalScreen.
  // Same opt-in prop name and default as BranchInfoSheet's. Mobile ignores it.
  desktop?: "screen" | "drawer";
};

// Full-screen map + swipeable branch-card picker. Controlled (open/onClose)
// so it can be triggered from different UIs — the order page's own "Filialni
// tanlang" field card (src/app/order/components/branches) and the header's
// "Manzil yoki filialni tanlash" pickup list
// (src/app/[page]/components/branch-selection) both open the same picker.
const BranchMapPicker = ({
  open,
  onClose,
  branches,
  workingTime,
  value,
  onSelect,
  title,
  readOnly = false,
  desktop = "screen",
}: BranchMapPickerProps) => {
  const t = useTranslations();
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const isDrawer = desktop === "drawer" && isDesktop;
  const controller = useBranchMapPicker({
    branches,
    value,
    onSelect,
    open,
    onClose,
    balloons: isDrawer,
  });
  const {
    list,
    activeBranches,
    mapState,
    openList,
    handleMapLoad,
    handleMapInstance,
  } = controller;

  if (!open) return null;

  if (isDrawer) {
    return (
      <BranchMapPickerDrawer
        controller={controller}
        onClose={onClose}
        workingTime={workingTime}
        title={title}
        readOnly={readOnly}
      />
    );
  }

  return (
    <ModalScreen onClose={onClose} placement="screen" className="gap-0 !p-0">
      <div className="relative flex h-dvh w-full flex-col overflow-hidden">
        <div className="z-10 flex items-center gap-3 border-b border-gray180 bg-white px-4 py-4">
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
            {title ?? t("select_branch")}
          </h1>
        </div>

        <div className="branch-map-picker relative min-h-0 flex-1">
          {/* The map chrome inside .branch-map-picker is hidden by the
              shared rule in globals.css (see its ToS note there). */}
          <style jsx global>{`
            /* Swiper's default .swiper-wrapper alignment is
               align-items: stretch, so every slide in the row stretches to
               match the tallest one — that's what was padding out the
               shorter branch cards. Swiper React doesn't support the
               wrapperClass prop, so this overrides it via a scoped selector
               instead — a single style tag is required per component
               (styled-jsx doesn't allow a second one), so it lives here
               rather than next to the Swiper below. It stays in this
               component (not globals.css) on purpose: it ties on
               specificity with swiper's own .swiper-autoheight
               .swiper-wrapper rule, so it must load after swiper's CSS.
               flex-end (not flex-start): autoHeight sizes the wrapper to
               the ACTIVE card only, and the whole sheet grows upward from a
               bottom anchor as that active card expands — with flex-start,
               every card hangs from the wrapper's TOP edge, so a still-
               collapsed neighbor gets dragged up along with that rising top
               edge even though its own height never changed. flex-end
               anchors every card's BOTTOM to the row's bottom edge instead,
               matching the sheet's own bottom anchor — a collapsed
               neighbor's bottom (and therefore its whole position) then
               stays put; only the expanding card's own top moves. */
            .branch-map-picker-cards .swiper-wrapper {
              align-items: flex-end;
            }
          `}</style>
          <YMaps
            query={{
              // "Placemark" must be loaded explicitly (matching
              // src/app/[page]/components/header/components/branch-dialog/branch-dialog.tsx's
              // load string) — without it there's no ymaps.Placemark class
              // for useBranchMapPicker.ts's renderPlacemarks to construct.
              load: "Map,Placemark,geoObject.addon.balloon",
              // @ts-expect-error react-yandex-maps types do not include Uzbek, but Yandex accepts it.
              lang: YANDEX_LANG,
              coordorder: "longlat",
              apikey: YANDEX_KEYS[0],
            }}
          >
            <Map
              state={mapState}
              onLoad={handleMapLoad}
              instanceRef={handleMapInstance}
              defaultOptions={{
                controls: ["zoomControl"],
                suppressMapOpenBlock: true,
              }}
              options={{
                controls: ["zoomControl"],
                suppressMapOpenBlock: true,
              }}
              className="h-full w-full"
            />
          </YMaps>

          {!list.value && (
            <button
              type="button"
              onClick={openList}
              className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-full bg-white px-5 py-3 text-sm font-medium text-black shadow-[0_10px_24px_rgba(0,0,0,0.16)]"
            >
              {t("location_branch_picker_choose_from_list", {
                count: activeBranches.length,
              })}
            </button>
          )}

          {list.value && (
            <BranchCardsSheet
              controller={controller}
              workingTime={workingTime}
              readOnly={readOnly}
            />
          )}
        </div>
      </div>
    </ModalScreen>
  );
};

export default BranchMapPicker;
