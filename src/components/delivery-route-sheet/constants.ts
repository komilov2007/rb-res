import type { BranchProps } from "@/types/branch";
import type {
  BranchMapInstance,
  BranchYMapsApi,
  Coordinates,
} from "@/types/yandex";

export const PIN_SIZE = 44;

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

export const BOUNDS_MARGIN = [PIN_SIZE + 56, 40, 40, 40];

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
