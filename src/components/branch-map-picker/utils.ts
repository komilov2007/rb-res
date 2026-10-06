import { DEFAULT_CENTER } from "@/constants/yandex";
import type { BranchProps } from "@/types/branch";
import type { BranchMapInstance, BranchYMapsApi, Coordinates } from "@/types/yandex";
import { getBranchLabel } from "@/utils/address";
import { buildBranchPinHref } from "@/utils/branch-pin";

export type MapViewState =
  | { center: Coordinates; zoom: number }
  | { bounds: [Coordinates, Coordinates] };

export type PlacemarkInstance = {
  events: { add: (event: string, handler: () => void) => void };
  balloon: { open: () => unknown };
};

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const STORE_ICON =
  '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/><path d="M22 7v3a2 2 0 0 1-2 2a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12a2 2 0 0 1-2-2V7"/></svg>';

const buildBranchBalloonHtml = (branch: BranchProps) =>
  `<div class="branch-balloon">` +
  `<span class="branch-balloon__icon">${STORE_ICON}</span>` +
  `<span class="branch-balloon__text">` +
  `<span class="branch-balloon__title">${escapeHtml(getBranchLabel(branch.name))}</span>` +
  `<span class="branch-balloon__address">${escapeHtml(branch.address)}</span>` +
  `</span></div>`;

export const branchCenter = (branch: BranchProps): Coordinates => [
  branch.longitude,
  branch.latitude,
];

const branchesBounds = (
  list: BranchProps[],
): [Coordinates, Coordinates] | null => {
  if (list.length === 0) return null;

  const lngs = list.map((branch) => branch.longitude);
  const lats = list.map((branch) => branch.latitude);
  const lngPad = Math.max((Math.max(...lngs) - Math.min(...lngs)) * 0.15, 0.005);
  const latPad = Math.max((Math.max(...lats) - Math.min(...lats)) * 0.2, 0.005);

  return [
    [Math.min(...lngs) - lngPad, Math.min(...lats) - latPad],
    [Math.max(...lngs) + lngPad, Math.max(...lats) + latPad],
  ];
};

const buildPinHref = (active: boolean) =>
  buildBranchPinHref("store", active ? 48 : 40);

export const getDefaultOverview = (
  activeBranches: BranchProps[],
): MapViewState => {
  if (activeBranches.length >= 2) {
    const bounds = branchesBounds(activeBranches);

    if (bounds) return { bounds };
  }

  const only = activeBranches[0];

  return only
    ? { center: branchCenter(only), zoom: 13 }
    : { center: DEFAULT_CENTER, zoom: 13 };
};

type DrawBranchPlacemarksParams = {
  mapInstance: BranchMapInstance;
  api: BranchYMapsApi;
  branches: BranchProps[];
  activeId: number | null;
  balloons: boolean;
  onBranchClick: (branch: BranchProps, index: number) => void;
};

export const drawBranchPlacemarks = ({
  mapInstance,
  api,
  branches,
  activeId,
  balloons,
  onBranchClick,
}: DrawBranchPlacemarksParams): PlacemarkInstance | null => {
  mapInstance.geoObjects.removeAll();

  let activePlacemark: PlacemarkInstance | null = null;

  branches.forEach((branch, index) => {
    const isActivePin = branch.id === activeId;
    const placemark = new api.Placemark(
      [branch.longitude, branch.latitude],
      { balloonContentBody: buildBranchBalloonHtml(branch) },
      {
        iconLayout: "default#image",
        iconImageHref: buildPinHref(isActivePin),
        iconImageSize: isActivePin ? [48, 48] : [40, 40],
        iconImageOffset: isActivePin ? [-24, -48] : [-20, -40],
        openBalloonOnClick: balloons,
        hideIconOnBalloonOpen: false,
        balloonPanelMaxMapArea: 0,
        balloonAutoPan: false,
        balloonOffset: isActivePin ? [0, -56] : [0, -48],
      },
    ) as PlacemarkInstance;

    placemark.events.add("click", () => onBranchClick(branch, index));
    mapInstance.geoObjects.add(placemark);

    if (isActivePin) activePlacemark = placemark;
  });

  return activePlacemark;
};
