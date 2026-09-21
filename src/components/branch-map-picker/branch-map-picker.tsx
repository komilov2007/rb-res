"use client";

import { useTranslations } from "next-intl";
import { ChevronLeft, Phone, Store } from "lucide-react";
import { Map, YMaps } from "react-yandex-maps";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";

import Button from "@/components/ui/button";
import ModalScreen from "@/components/modal/screen-modal";
import { WEEKDAYS } from "@/constants/weekdays";
import { YANDEX_KEYS, YANDEX_LANG } from "@/constants/yandex";
import type { BranchProps } from "@/types/branch";
import type { GeneralProps } from "@/types/general";

import { useBranchMapPicker } from "./useBranchMapPicker";

const formatTime = (time: string) => time.slice(0, 5);

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
}: BranchMapPickerProps) => {
  const t = useTranslations();
  const {
    list,
    swiperRef,
    activeId,
    activeBranches,
    mapState,
    openList,
    closeList,
    handleSlideChange,
    chooseBranch,
    handleMapLoad,
    handleMapInstance,
  } = useBranchMapPicker({ branches, value, onSelect, open, onClose });

  if (!open) return null;

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
          <h1 className="text-base font-extrabold text-black">
            {title ?? t("select_branch")}
          </h1>
        </div>

        <div className="branch-map-picker relative min-h-0 flex-1">
          {/* Yandex Maps' terms of use prohibit hiding/obscuring the
              copyright panel ("Open in Yandex Maps" / "Terms of use" links
              and the Yandex Maps logo) — this CSS block hides that panel
              anyway, copied verbatim (same selectors, same `style jsx
              global` technique) from the other places this app already does
              this: src/components/modal/location-modal/components/location-map.tsx
              and src/app/[page]/components/header/components/branch-dialog/branch-dialog.tsx.
              Applying it here only for consistency with that existing,
              pre-established in-app decision — it does not make the
              underlying ToS conflict go away. Whether to keep doing this
              across the app or revert it everywhere is a business decision,
              not a technical one. */}
          <style jsx global>{`
            .branch-map-picker [class*="controls-pane"],
            .branch-map-picker [class*="controls__toolbar"],
            .branch-map-picker [class*="float-button"],
            .branch-map-picker [class*="search"],
            .branch-map-picker [class*="traffic"],
            .branch-map-picker [class*="type-selector"],
            .branch-map-picker [class*="fullscreen"],
            .branch-map-picker [class*="ruler"],
            .branch-map-picker [class*="geolocation"],
            .branch-map-picker [class*="copyright"],
            .branch-map-picker [class*="gototech"],
            .branch-map-picker [class*="gotoymaps"],
            .branch-map-picker [class*="scale"] {
              display: none !important;
            }

            /* Swiper's default .swiper-wrapper alignment is
               align-items: stretch, so every slide in the row stretches to
               match the tallest one — that's what was padding out the
               shorter branch cards. Swiper React doesn't support the
               wrapperClass prop, so this overrides it via a scoped selector
               instead — a single style tag is required per component
               (styled-jsx doesn't allow a second one), so it lives here
               alongside the map chrome rules above rather than next to the
               Swiper below.
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
              load: "Map,Placemark",
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
              className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-full bg-white px-5 py-3 text-sm font-bold text-black shadow-[0_10px_24px_rgba(0,0,0,0.16)]"
            >
              {t("location_branch_picker_choose_from_list", {
                count: activeBranches.length,
              })}
            </button>
          )}

          {list.value && (
            // bottom-0 anchors the sheet to the screen's bottom edge, so
            // growing its height (autoHeight below) extends it upward, not
            // down past the fold — the fix the previous max-h-[60dvh] cap
            // undid, by keeping the sheet's own height fixed and instead
            // scrolling its *content* downward inside that fixed box.
            // max-h-[85dvh] (matching ModalScreen's own bottom-sheet cap)
            // gives a expanded card (all 7 days + phone) enough room to
            // grow into on a normal phone without ever needing to scroll,
            // while still leaving a sliver of map visible up top. The bottom padding
            // lifts the whole card (and its "Bu yerdan olaman" action) off the
            // screen edge so the sheet reads as opening higher up.
            <div className="absolute inset-x-0 bottom-0 z-10 flex max-h-[85dvh] flex-col overflow-hidden rounded-t-3xl bg-gray10 pb-[max(44px,calc(env(safe-area-inset-bottom)+28px))]">
              <button
                type="button"
                onClick={closeList}
                aria-label={t("location_branch_picker_close_list")}
                className="flex h-11 w-full shrink-0 items-center justify-center"
              >
                <span className="h-1.5 w-10 rounded-full bg-gray180" />
              </button>

              {/* max-h (85dvh minus the h-11 handle button above) is only a
                  last-resort safety net for a branch with truly excessive
                  working-hours data (many time windows per day) that
                  wouldn't fit even the raised 85dvh cap above — CSS
                  max-height always wins over autoHeight's larger inline
                  height, so that content scrolls internally
                  (overflow-y-auto) instead of silently clipping. In the
                  normal case the card is shorter than this, so autoHeight's
                  own sizing is what's actually seen — this cap doesn't
                  visibly kick in. */}
              <Swiper
                grabCursor
                simulateTouch
                autoHeight
                slidesPerView="auto"
                spaceBetween={12}
                onSwiper={(swiper) => {
                  swiperRef.current = swiper;
                }}
                onSlideChange={handleSlideChange}
                className="branch-map-picker-cards min-h-0 max-h-[calc(85dvh-7rem)] overflow-y-auto !px-4 !pb-2 !pt-3"
              >
                {activeBranches.map((branch) => {
                  return (
                    <SwiperSlide
                      key={branch.id}
                      className={
                        activeBranches.length === 1
                          ? "!h-auto !w-full"
                          : "!h-auto !w-[85%] max-w-[340px]"
                      }
                    >
                      <div
                        className={`flex flex-col gap-4 rounded-2xl bg-white p-5 ${
                          branch.id === activeId ? "ring-2 ring-green-500" : ""
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <Store
                            size={16}
                            className="mt-0.5 shrink-0 text-gray220"
                          />
                          <p className="text-sm font-bold text-black">
                            {branch.name}
                          </p>
                        </div>
                        <p className="text-sm font-medium text-gray220">
                          {branch.address}
                        </p>

                        {branch.phone && (
                          <a
                            href={`tel:${branch.phone}`}
                            className="flex items-center gap-2 text-sm font-medium text-black"
                          >
                            <Phone
                              size={14}
                              className="shrink-0 text-gray220"
                            />
                            {branch.phone}
                          </a>
                        )}

                        {/* Always fully expanded — the whole week is shown
                            at once, no show-more toggle. */}
                        <div className="flex flex-col gap-1.5">
                          <p className="text-xs font-bold text-black">
                            {t("location_branch_picker_schedule")}
                          </p>
                          <ul className="flex flex-col gap-1">
                            {WEEKDAYS.map((day, index) => {
                              const entry = workingTime?.[String(index + 1)];
                              const isClosed =
                                !entry ||
                                entry.is_closed ||
                                entry.hours.length === 0;

                              return (
                                <li
                                  key={day}
                                  className="flex items-start justify-between gap-3 text-xs font-medium text-gray220"
                                >
                                  <span className="shrink-0">
                                    {t(`weekdays_${index + 1}`)}:
                                  </span>
                                  {isClosed ? (
                                    <span>—</span>
                                  ) : (
                                    <span className="text-right text-black">
                                      {entry.hours.map((hour, hourIndex) => (
                                        <span key={hourIndex} className="block">
                                          {formatTime(hour.open)} -{" "}
                                          {formatTime(hour.close)}
                                        </span>
                                      ))}
                                    </span>
                                  )}
                                </li>
                              );
                            })}
                          </ul>
                        </div>

                        {!readOnly && (
                          <Button
                            type="button"
                            variant="primary-solid"
                            size="primaryWide"
                            onClick={() => chooseBranch(branch)}
                          >
                            {t("location_branch_picker_pick_here")}
                          </Button>
                        )}
                      </div>
                    </SwiperSlide>
                  );
                })}
              </Swiper>
            </div>
          )}
        </div>
      </div>
    </ModalScreen>
  );
};

export default BranchMapPicker;
