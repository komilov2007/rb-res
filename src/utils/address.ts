import { translate } from "@/utils/translate";

export const getBranchLabel = (name?: string | null) => {
  if (!name) return translate("common_branch");
  return /filial/i.test(name)
    ? name
    : translate("location_branch_label", { name });
};

const GENERIC_ADDRESS_PARTS = [
  "uzbekistan",
  "o'zbekiston",
  "oʻzbekiston",
  "узбекистан",
  "tashkent",
  "toshkent",
  "ташкент",
];

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
