import type { DeliveryType } from "@/types/order";

// Service types the customer collects from a branch — these need a branch
// instead of an address.
export const PICKUP_TYPES: DeliveryType[] = ["PICKUP", "BTS_PICKUP"];

// Service types delivered to the customer's address — the only ones that
// need an address and get a delivery price calculation.
export const SERVICE_DELIVERIES: DeliveryType[] = [
  "DELIVERY",
  "YANDEX_DELIVERY",
  "NOOR_DELIVERY",
];

// Third-party courier providers — their delivery calculation additionally
// sends service_type and the address coordinates.
export const PROVIDER_DELIVERIES: DeliveryType[] = [
  "YANDEX_DELIVERY",
  "NOOR_DELIVERY",
];

// Delivery calculation `delivery_type` values whose price is added to the
// order total. Confirmed live: general.delivery.delivery_type is "FIXED" —
// this is a price type, not a delivery provider. "FLEXABLE" is the backend's
// own spelling.
export const PRICED_DELIVERY_TYPES = ["FIXED", "FLEXABLE"];

export const isPickupType = (value?: DeliveryType | null) =>
  Boolean(value && PICKUP_TYPES.includes(value));

export const isServiceDelivery = (value?: DeliveryType | null) =>
  Boolean(value && SERVICE_DELIVERIES.includes(value));

export const isProviderDelivery = (value?: DeliveryType | null) =>
  Boolean(value && PROVIDER_DELIVERIES.includes(value));
