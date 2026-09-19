// Moved out of src/app/[page]/components/branch-selection/utils.ts — these
// two were already imported by several unrelated features (profile/about,
// profile/addresses, card-product/unavailable-branch-list) despite living
// under one route's folder; order-detail-sections and delivery-route-sheet
// are two more. findClosestBranch stays behind — it's branch-selection's
// own concern, nothing else needs it.

import { translate } from "@/utils/translate";

// "Chilonzor" -> "Chilonzor filiali"; names that already say "filial" stay.
export const getBranchLabel = (name?: string | null) => {
  if (!name) return translate("common.branch");
  return /filial/i.test(name)
    ? name
    : translate("location.branch_label", { name });
};

// Country/city parts geocoded addresses start with — they carry no
// information inside a single shop's delivery area.
const GENERIC_ADDRESS_PARTS = [
  "uzbekistan",
  "o'zbekiston",
  "oʻzbekiston",
  "узбекистан",
  "tashkent",
  "toshkent",
  "ташкент",
];

// "Uzbekistan, Tashkent, Chilonzor 9-mavze, 24-uy, 15-xonadon"
// -> "Chilonzor 9-mavze, 24-uy"
export const getShortAddress = (address: string) => {
  const parts = address
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  const specificParts = parts.filter(
    (part) => !GENERIC_ADDRESS_PARTS.includes(part.toLowerCase()),
  );
  return (
    (specificParts.length ? specificParts : parts).slice(0, 2).join(", ") ||
    address
  );
};
