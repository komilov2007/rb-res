"use client";

import { useState } from "react";
import { Map, YMaps } from "react-yandex-maps";
import { useTranslations } from "next-intl";

import Button from "@/components/ui/button";
import XButton from "@/components/ui/x-button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { SectionLabel } from "@/components/branch-selection/selection-parts";
import { YANDEX_KEYS, YANDEX_LANG } from "@/constants/yandex";
import type { GeneralProps } from "@/types/general";

import BranchRow from "./branch-row";
import DrawerSchedule from "./drawer-schedule";
import type { BranchMapPickerController } from "./useBranchMapPicker";

// scrollZoom is deliberately absent: the map now sits inside the drawer's
// scroll area, and Yandex's default wheel behaviour would swallow the wheel
// to zoom instead of letting the drawer scroll past it. Drag still pans and
// the zoomControl buttons still zoom. Same set (and the same POI reasoning)
// as useBranchInfoMap's MAP_OPTIONS.
const MAP_OPTIONS = {
  controls: ["zoomControl"],
  suppressMapOpenBlock: true,
  yandexMapDisablePoiInteractivity: true,
  behaviors: ["drag", "dblClickZoom"],
};

type BranchMapPickerDrawerProps = {
  controller: BranchMapPickerController;
  onClose: () => void;
  workingTime?: GeneralProps["working_time"];
  title?: string;
  readOnly: boolean;
};

// Desktop-only layout for BranchMapPicker: a right-side drawer with the map
// on top, the shop's weekly schedule under it and the full branch list
// below — instead of mobile's full-screen map + swipeable cards. The
// controller is passed in (not re-created here) so useBranchMapPicker is
// still called exactly once, in branch-map-picker.tsx.
const BranchMapPickerDrawer = ({
  controller,
  onClose,
  workingTime,
  title,
  readOnly,
}: BranchMapPickerDrawerProps) => {
  const t = useTranslations();
  const {
    activeId,
    activeBranches,
    mapState,
    highlightBranch,
    chooseBranch,
    handleMapLoad,
    handleMapInstance,
  } = controller;
  // Same shimmer gate BranchInfoSheet uses: the Yandex script can take a
  // beat, and an unpainted map container reads as a broken half-map.
  const [isMapReady, setIsMapReady] = useState(false);
  const activeBranch =
    activeBranches.find((branch) => branch.id === activeId) ?? null;

  const onMapLoad = (api: unknown) => {
    setIsMapReady(true);
    handleMapLoad(api);
  };

  // No scroll-into-view on the highlighted row: the map scrolls together
  // with the list now, so pulling a row into view would push the map the
  // user just tapped off screen. The row's tint is enough.
  return (
    <Sheet open onOpenChange={(next) => !next && onClose()}>
      <SheetContent
        side="right"
        showCloseButton={false}
        aria-describedby={undefined}
        className="w-[480px] max-w-[480px] gap-0 border-l border-gray180 p-0 sm:max-w-[480px]"
      >
        <SheetTitle className="sr-only">
          {title ?? t("select_branch")}
        </SheetTitle>

        <div className="flex h-full w-full flex-col overflow-hidden bg-white">
          {/* Title left, close on the right — same header shape as the cart
              drawer (cart-header.tsx). */}
          <div className="z-10 flex shrink-0 items-center justify-between gap-3 border-b border-gray180 bg-white px-4 py-4">
            <h1 className="min-w-0 truncate text-base font-medium text-black">
              {title ?? t("select_branch")}
            </h1>
            <XButton size="sm" onClick={onClose} />
          </div>

          {/* One scroll area for the whole body: the schedule, the list and
              the map all move together, so expanding the schedule or having
              many branches just scrolls instead of squeezing the map into a
              pinned strip. Only the header and the pick action stay put. */}
          <div className="scroll-panel min-h-0 flex-1 overflow-y-auto">
          <DrawerSchedule workingTime={workingTime} />

          <div className="py-1">
            <div className="flex items-center justify-between gap-2 px-4 py-2">
              <SectionLabel>
                {t("home_branch_selection_available_branches")}
              </SectionLabel>
              <span className="shrink-0 text-xs font-normal text-gray220">
                {activeBranches.length}
              </span>
            </div>

            {activeBranches.length === 0 ? (
              <p className="px-4 py-2 text-sm font-normal text-gray220">
                {t("home_branch_selection_branches_not_found")}
              </p>
            ) : (
              <div className="divide-y divide-gray180/70">
                {activeBranches.map((branch) => (
                  <BranchRow
                    key={branch.id}
                    branch={branch}
                    isActive={branch.id === activeId}
                    onClick={() => highlightBranch(branch)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Map last, under the list, scrolling with it. Its height is a
              fixed px box (not a %) on purpose: Yandex measures its container
              once at construction, so a box that resizes afterwards leaves
              the canvas sized for the old one. globals.css hides the Yandex
              chrome through the `branch-map-picker` class. */}
          <div className="branch-map-picker relative mx-4 mb-3 mt-3 h-[340px] overflow-hidden rounded-2xl bg-white">
            {!isMapReady && <div className="skeleton absolute inset-0 z-10" />}

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
                state={mapState}
                onLoad={onMapLoad}
                instanceRef={handleMapInstance}
                defaultOptions={MAP_OPTIONS}
                options={MAP_OPTIONS}
                className="h-full w-full"
              />
            </YMaps>
          </div>
          </div>

          {!readOnly && (
            <div className="shrink-0 border-t border-gray180 p-4">
              <Button
                type="button"
                variant="primary-solid"
                size="primaryWide"
                disabled={!activeBranch}
                onClick={() => activeBranch && chooseBranch(activeBranch)}
              >
                {t("location_branch_picker_pick_here")}
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default BranchMapPickerDrawer;
