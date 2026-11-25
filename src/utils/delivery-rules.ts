import type { GeneralProps } from "@/types/general";
import type { ServiceTypeValue } from "@/types/order";

// Shop delivery/min-order business rules (ported from rb-webapp cart.tsx).
// Backend: GET webapp/general/{shop} → services[].min_price per service,
// delivery.{delivery_type, price, text, inital_km, inital_km_price, every_km_price}.

const DELIVERY_SERVICES: ServiceTypeValue[] = [
  "DELIVERY",
  "YANDEX_DELIVERY",
  "NOOR_DELIVERY",
];

const toNumber = (value: number | string | null | undefined) => {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : null;
};

const getActiveServices = (general?: GeneralProps | null) =>
  general?.services?.filter((service) => service.is_active) ?? [];

// Minimal order sum for a service. Falls back to the legacy shop-level fields
// when the service entry has no min_price.
export const getServiceMinPrice = (
  general: GeneralProps | null | undefined,
  serviceType: ServiceTypeValue | null | undefined,
): number | null => {
  if (!general || !serviceType) return null;

  const service = getActiveServices(general).find(
    (item) => item.type === serviceType,
  );
  const fromService = toNumber(service?.min_price);

  if (fromService !== null) return fromService;
  if (service && service.min_price === null && serviceType === "PICKUP") {
    return null;
  }

  switch (serviceType) {
    case "DELIVERY":
      return toNumber(general.delivery?.min_price);
    case "YANDEX_DELIVERY":
      return toNumber(general.yandex_delivery_min_price);
    case "NOOR_DELIVERY":
      return toNumber(general.noor_delivery_min_price);
    default:
      return null;
  }
};

// True when the shop has no active delivery service of any kind.
export const isOnlyPickup = (general?: GeneralProps | null) => {
  const services = getActiveServices(general);

  return (
    services.length > 0 &&
    services.every((service) => !DELIVERY_SERVICES.includes(service.type))
  );
};

export type DeliveryInfo =
  | { kind: "free" }
  | { kind: "fixed"; price: number }
  | {
      kind: "flexible";
      initialKm: number | null;
      initialPrice: number | null;
      kmPrice: number | null;
    }
  | { kind: "custom"; text: string | null };

// Courier (DELIVERY) pricing model configured by the shop.
export const getDeliveryInfo = (
  general?: GeneralProps | null,
): DeliveryInfo | null => {
  const delivery = general?.delivery;

  if (!delivery) return null;

  switch (delivery.delivery_type) {
    case "FREE":
      return { kind: "free" };
    case "FIXED": {
      const price = toNumber(delivery.price);
      return price === null ? { kind: "free" } : { kind: "fixed", price };
    }
    case "FLEXABLE":
      return {
        kind: "flexible",
        initialKm: toNumber(delivery.inital_km),
        initialPrice: toNumber(delivery.inital_km_price),
        kmPrice: toNumber(delivery.every_km_price),
      };
    case "CUSTOM":
      return { kind: "custom", text: delivery.text?.trim() || null };
    default:
      return null;
  }
};

export const isCustomDelivery = (general?: GeneralProps | null) =>
  general?.delivery?.delivery_type === "CUSTOM";
