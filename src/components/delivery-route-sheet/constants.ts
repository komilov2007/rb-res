import type { BranchProps } from "@/types/branch";
import type {
  BranchMapInstance,
  BranchYMapsApi,
  Coordinates,
} from "@/types/yandex";

export const PIN_SIZE = 44;

// Not modeled in src/types/yandex.ts — that file only covers the single-
// marker Placemark case. templateLayoutFactory isn't typed by
// react-yandex-maps either, so this stays a narrow local extension, same
// approach as useBranchMapPicker.ts's own PlacemarkInstance type.
export type DeliveryMapApi = BranchYMapsApi & {
  templateLayoutFactory: {
    createClass: (template: string) => unknown;
  };
};

export type DeliveryMapInstance = BranchMapInstance & {
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
export const BOUNDS_MARGIN = [PIN_SIZE + 56, 40, 40, 40];

// How long the intro chips above the two pins stay on the map. Also drives
// the .delivery-route-chip animation below, which fades them out right
// before they're removed.
export const CHIP_DURATION_MS = 4000;

export const MAP_OPTIONS = {
  controls: ["zoomControl"],
  suppressMapOpenBlock: true,
  yandexMapDisablePoiInteractivity: true,
  behaviors: ["drag", "dblClickZoom"],
};

export const branchPoint = (branch: BranchProps): Coordinates => [
  branch.longitude,
  branch.latitude,
];

