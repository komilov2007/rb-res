import type { Coordinates } from "@/types/yandex";

export const DEFAULT_CENTER: Coordinates = [69.2797, 41.3111];

// Comma-separated in NEXT_PUBLIC_YANDEX_KEYS (.env / hosting env settings),
// tried in order by utils/yandex.ts when one hits its quota. NEXT_PUBLIC_
// values are inlined into the client bundle at build time, so this keeps the
// keys out of git — it does not hide them from the browser.
export const YANDEX_KEYS = (process.env.NEXT_PUBLIC_YANDEX_KEYS ?? "")
  .split(",")
  .map((key) => key.trim())
  .filter(Boolean);

export const YANDEX_LANG = "uz_UZ";

// Language of address *text* picked on the map (reverse geocode + address
// search in the location modal). Kept separate from YANDEX_LANG, which
// only drives the map tiles' own labels: the picked address is what gets
// saved to the backend and shown back everywhere. Russian — the backend
// returns saved addresses in Russian regardless of what was sent, so the
// picker matches it end to end.
export const YANDEX_ADDRESS_LANG = "ru_RU";

