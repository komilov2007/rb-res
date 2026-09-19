import type { GeneralProps } from "@/types/general";
import type { DeliveryType } from "@/types/order";

type OrderOptionProps = {
  label: string;
  desc: string;
};

// Translation keys (messages: order.delivery_type.options.*) for the
// label/description per service type, keyed by the lowercase service type.
// Rendered via t(). Only service types present in general.services are rendered.
export const ORDER_OPTIONS: Record<Lowercase<DeliveryType>, OrderOptionProps> = {
  pickup: {
    label: "order_page.delivery_type.options.pickup.label",
    desc: "order_page.delivery_type.options.pickup.desc",
  },
  delivery: {
    label: "order_page.delivery_type.options.delivery.label",
    desc: "order_page.delivery_type.options.delivery.desc",
  },
  bts_pickup: {
    label: "order_page.delivery_type.options.bts_pickup.label",
    desc: "order_page.delivery_type.options.bts_pickup.desc",
  },
  yandex_delivery: {
    label: "order_page.delivery_type.options.yandex_delivery.label",
    desc: "order_page.delivery_type.options.yandex_delivery.desc",
  },
  noor_delivery: {
    label: "order_page.delivery_type.options.noor_delivery.label",
    desc: "order_page.delivery_type.options.noor_delivery.desc",
  },
};

export const getOrderOption = (type: DeliveryType) =>
  ORDER_OPTIONS[type.toLowerCase() as Lowercase<DeliveryType>];

// Services the order page can offer: active in general.services and known to
// ORDER_OPTIONS.
export const getAvailableServices = (services: GeneralProps["services"]) =>
  services?.filter(
    (service) =>
      service.is_active && service.type.toLowerCase() in ORDER_OPTIONS,
  ) ?? [];
