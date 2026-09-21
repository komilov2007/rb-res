import { DEFAULT_CENTER } from "@/constants/yandex";
import type { BranchProps } from "@/types/branch";
import type { Coordinates } from "@/types/yandex";
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
};

export const branchCenter = (branch: BranchProps): Coordinates => [
  branch.longitude,
  branch.latitude,
];

export const branchesBounds = (
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
export const buildPinHref = (active: boolean) =>
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
