import type { ServiceTypeValue } from "@/types/order";

// Confirmed set — provider-delivery service types count as "delivery" for
// the address-display rule below, matching order-placing's own check
// (STEP 32) that this section set was extracted from.
export const DELIVERY_TYPES: ServiceTypeValue[] = [
  "DELIVERY",
  "NOOR_DELIVERY",
  "YANDEX_DELIVERY",
];

// Display-only labels for the "Xizmat turi" row's free-of-charge fallback —
// not a new backend contract, just copy for the already-confirmed
// ServiceTypeValue enum.
export const SERVICE_TYPE_LABELS: Record<ServiceTypeValue, string> = {
  PICKUP: "orders_service_types_pickup",
  BTS_PICKUP: "orders_service_types_pickup",
  DELIVERY: "orders_service_types_delivery",
  YANDEX_DELIVERY: "orders_service_types_yandex_delivery",
  NOOR_DELIVERY: "orders_service_types_noor_delivery",
};
