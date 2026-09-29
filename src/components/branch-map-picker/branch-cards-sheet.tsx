"use client";

import { useTranslations } from "next-intl";
import { Swiper, SwiperSlide } from "swiper/react";

import type { GeneralProps } from "@/types/general";

import BranchCard from "./branch-card";
import type { BranchMapPickerController } from "./useBranchMapPicker";

type BranchCardsSheetProps = {
  controller: BranchMapPickerController;
  workingTime?: GeneralProps["working_time"];
  readOnly: boolean;
};

// Mobile-only bottom sheet of swipeable branch cards over the full-screen
// map. The controller is passed in (not re-created here) so
// useBranchMapPicker is still called exactly once, in branch-map-picker.tsx.
// The `.branch-map-picker-cards .swiper-wrapper` override it relies on lives
// in branch-map-picker.tsx's style tag (see the comment there).
const BranchCardsSheet = ({
  controller,
  workingTime,
  readOnly,
}: BranchCardsSheetProps) => {
  const t = useTranslations();
  const {
    swiperRef,
    activeId,
    activeBranches,
    closeList,
    handleSlideChange,
    chooseBranch,
  } = controller;

  return (
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
              <BranchCard
                branch={branch}
                isActive={branch.id === activeId}
                workingTime={workingTime}
                readOnly={readOnly}
                onChoose={() => chooseBranch(branch)}
              />
            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
};

export default BranchCardsSheet;
