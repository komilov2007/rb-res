import { DEFAULT_CENTER } from "@/constants/yandex";
import type { BranchProps } from "@/types/branch";
import type {
  BranchMapInstance,
  BranchYMapsApi,
  Coordinates,
} from "@/types/yandex";
import { getBranchLabel } from "@/utils/address";
import { buildBranchPinHref } from "@/utils/branch-pin";

export type MapViewState =
  | { center: Coordinates; zoom: number }
  | { bounds: [Coordinates, Coordinates] };

// A constructed ymaps.Placemark instance — BranchYMapsApi only types the
// constructor (returns unknown), not the instance surface, so this covers
// the one extra member used here beyond what src/types/yandex.ts already
// models for the single-marker case in header.tsx/branch-dialog.tsx.
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

// lucide's Store glyph — the same icon the drawer's rows use.
const STORE_ICON =
  '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/><path d="M22 7v3a2 2 0 0 1-2 2a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12a2 2 0 0 1-2-2V7"/></svg>';

// Balloon body for a branch pin. Yandex renders it as raw HTML, so the
// API-supplied name/address are escaped. Styled by the `.branch-balloon`
// rules in globals.css.
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
  // Padding around the outermost branches so their pins (drawn above the
  // point) aren't cut off at the map's edges.
  const lngPad = Math.max((Math.max(...lngs) - Math.min(...lngs)) * 0.15, 0.005);
  const latPad = Math.max((Math.max(...lats) - Math.min(...lats)) * 0.2, 0.005);

  return [
    [Math.min(...lngs) - lngPad, Math.min(...lats) - latPad],
    [Math.max(...lngs) + lngPad, Math.max(...lats) + latPad],
  ];
};

// Every branch gets the same Store glyph (matching each branch card's own
// Store icon); the picked/active one is just drawn larger. Glyph/badge
// building itself is shared — see its own comment.
const buildPinHref = (active: boolean) =>
  buildBranchPinHref("store", active ? 48 : 40);

// Overview of every active branch: fitted bounds for 2+, the single
// branch centred for 1, the default city centre for none.
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

// Clears the map and adds one pin per branch. Returns the active branch's
// placemark (if any) so the caller can open its balloon.
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
        // openBalloonOnClick is Yandex's default, so this only has to
        // turn it OFF where we don't want it.
        openBalloonOnClick: balloons,
        // Keep the pin drawn under its own balloon (Yandex hides it by
        // default), and never let the balloon fall back to the panel
        // layout that covers the whole map — at the drawer's width that
        // is the mode it would otherwise pick.
        hideIconOnBalloonOpen: false,
        balloonPanelMaxMapArea: 0,
        // The map is already centred on the pin; auto-panning to fit the
        // balloon would push the pin back off centre.
        balloonAutoPan: false,
        // The balloon anchors on the geometry point, which is the pin's
        // bottom tip (see iconImageOffset), so by default it opens over
        // the pin. Lift it by the pin's own height plus a few px of gap
        // to sit clear above it.
        balloonOffset: isActivePin ? [0, -56] : [0, -48],
      },
    ) as PlacemarkInstance;

    placemark.events.add("click", () => onBranchClick(branch, index));
    mapInstance.geoObjects.add(placemark);

    if (isActivePin) activePlacemark = placemark;
  });

  return activePlacemark;
};
