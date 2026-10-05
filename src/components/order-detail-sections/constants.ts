import type { ServiceTypeValue } from "@/types/order";

export const DELIVERY_TYPES: ServiceTypeValue[] = [
  "DELIVERY",
  "NOOR_DELIVERY",
  "YANDEX_DELIVERY",
];

export const SERVICE_TYPE_LABELS: Record<ServiceTypeValue, string> = {
  PICKUP: "orders_service_types_pickup",
  BTS_PICKUP: "orders_service_types_pickup",
  DELIVERY: "orders_service_types_delivery",
  YANDEX_DELIVERY: "orders_service_types_yandex_delivery",
  NOOR_DELIVERY: "orders_service_types_noor_delivery",
};
