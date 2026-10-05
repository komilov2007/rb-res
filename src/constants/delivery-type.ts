import type { DeliveryType } from "@/types/order";

export const PICKUP_TYPES: DeliveryType[] = ["PICKUP", "BTS_PICKUP"];

export const SERVICE_DELIVERIES: DeliveryType[] = [
  "DELIVERY",
  "YANDEX_DELIVERY",
  "NOOR_DELIVERY",
];

export const PROVIDER_DELIVERIES: DeliveryType[] = [
  "YANDEX_DELIVERY",
  "NOOR_DELIVERY",
];

export const PRICED_DELIVERY_TYPES = ["FIXED", "FLEXABLE"];

export const isPickupType = (value?: DeliveryType | null) =>
  Boolean(value && PICKUP_TYPES.includes(value));

export const isServiceDelivery = (value?: DeliveryType | null) =>
  Boolean(value && SERVICE_DELIVERIES.includes(value));

export const isProviderDelivery = (value?: DeliveryType | null) =>
  Boolean(value && PROVIDER_DELIVERIES.includes(value));
