"use client";

import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronDown } from "lucide-react";
import { Map, YMaps } from "react-yandex-maps";
import Button from "@/components/ui/button";
import ModalScreen from "@/components/modal/screen-modal";
import { YANDEX_KEYS, YANDEX_LANG } from "@/constants/yandex";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import type { BranchProps } from "@/types/branch";
import type { GeneralProps } from "@/types/general";
import { BranchCardsSheet } from "./branch-cards-sheet";
import BranchMapPickerDrawer from "./branch-map-picker-drawer";
import { useBranchMapPicker } from "./useBranchMapPicker";
import "swiper/css";
import { IconClockFilled } from "@tabler/icons-react";
import BranchSchedule from "@/components/branch-schedule";
import { RowText } from "@/components/branch-selection/selection-parts";
import { useBoolean } from "@/hooks/useBoolean";
import { formatTime, getDayIndex } from "@/utils/working-time";

type BranchMapPickerProps = {
  open: boolean;
  onClose: () => void;
  branches?: BranchProps[];
  workingTime?: GeneralProps["working_time"];
  value: number | null;
  onSelect: (branchId: number) => void;
  title?: string;
  readOnly?: boolean;
  desktop?: "screen" | "drawer";
};

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
          <style jsx global>{`
            .branch-map-picker-cards .swiper-wrapper {
              align-items: flex-end;
            }
          `}</style>
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

type DrawerScheduleProps = {
  workingTime?: GeneralProps["working_time"];
};

const DrawerSchedule = ({ workingTime }: DrawerScheduleProps) => {
  const t = useTranslations();
  const schedule = useBoolean();

  const todayEntry = workingTime?.[String(getDayIndex())];
  const todayHours =
    !todayEntry || todayEntry.is_closed || todayEntry.hours.length === 0
      ? t("common_closed")
      : todayEntry.hours
          .map((hour) => `${formatTime(hour.open)} - ${formatTime(hour.close)}`)
          .join(", ");

  return (
    <div className="border-b border-gray180 px-4 py-2">
      <button
        type="button"
        onClick={schedule.toggle}
        aria-expanded={schedule.value}
        className="flex w-full items-center gap-3 py-1 text-left"
      >
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gray10 text-gray220">
          <IconClockFilled size={16} />
        </span>
        <RowText
          title={t("location_branch_picker_schedule")}
          description={todayHours}
        />
        <ChevronDown
          size={16}
          className={`shrink-0 text-gray220 transition-transform duration-300 ease-out ${
            schedule.value ? "rotate-180" : ""
          }`}
        />
      </button>

      <div
        className={`grid transition-all duration-300 ease-out ${
          schedule.value
            ? "grid-rows-[1fr] opacity-100"
            : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="mb-1 mt-2 pl-11">
            <BranchSchedule workingTime={workingTime} title={null} />
          </div>
        </div>
      </div>
    </div>
  );
};

export { DrawerSchedule, BranchMapPicker };

export default BranchMapPicker;
