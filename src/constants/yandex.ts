import type { Coordinates } from "@/types/yandex";

export const DEFAULT_CENTER: Coordinates = [69.2797, 41.3111];

export const YANDEX_KEYS = [
  "8b56a857-f05f-4dc6-a91b-bc58f302ff21",
  "a2617277-0573-40b0-a017-85d5da6270eb",
  "d2633460-8cef-4761-a075-28606eb1cef6",
  "a6109ff2-9e28-48bc-86b5-a5366e8be390",
  "29294198-6cdc-4996-a870-01e89b830f3e",
  "b2f23b5a-acf4-4e88-947e-a53e339ab0dc",
  "e01731fd-cbf5-4a15-9a50-14d7d90a78d7",
  "920e70cd-e1fc-4fd7-9850-bfc247be19a3",
  "7ed63f44-0c83-4e1f-a456-c528f4ed6d19",
  "dc1abcd2-f2d1-41ee-bd17-660fa80252dd",
  "b81050f7-3f69-451d-9df4-ae7826ea9608",
  "2c4f4a02-44c7-4ebf-b284-ddcaca7e7194",
  "efd82add-b8a3-4ab0-9eee-6679773a9bfa",
  "330146a7-79ea-47fa-88bc-58c1e19a7ace",
  "7f679306-5864-4f37-9bbd-8cc3c7bdbf1f",
  "f120d3c7-03d7-4eac-b814-cbb099897ef2",
  "3d526ed2-fa3c-43b1-b68a-360936d205b5",
];

export const YANDEX_LANG = "uz_UZ";

// Language of address *text* picked on the map (reverse geocode + address
// search in the location modal). Kept separate from YANDEX_LANG, which
// only drives the map tiles' own labels: the picked address is what gets
// saved to the backend and shown back everywhere. Russian — the backend
// returns saved addresses in Russian regardless of what was sent, so the
// picker matches it end to end.
export const YANDEX_ADDRESS_LANG = "ru_RU";

