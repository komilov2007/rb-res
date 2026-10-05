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
    <div className="absolute inset-x-0 bottom-0 z-10 flex max-h-[85dvh] flex-col overflow-hidden rounded-t-3xl bg-gray10 pb-[max(44px,calc(env(safe-area-inset-bottom)+28px))]">
      <button
        type="button"
        onClick={closeList}
        aria-label={t("location_branch_picker_close_list")}
        className="flex h-11 w-full shrink-0 items-center justify-center"
      >
        <span className="h-1.5 w-10 rounded-full bg-gray180" />
      </button>

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
