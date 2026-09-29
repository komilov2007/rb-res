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
    label: "order_page_delivery_type_options_pickup_label",
    desc: "order_page_delivery_type_options_pickup_desc",
  },
  delivery: {
    label: "order_page_delivery_type_options_delivery_label",
    desc: "order_page_delivery_type_options_delivery_desc",
  },
  bts_pickup: {
    label: "order_page_delivery_type_options_bts_pickup_label",
    desc: "order_page_delivery_type_options_bts_pickup_desc",
  },
  yandex_delivery: {
    label: "order_page_delivery_type_options_yandex_delivery_label",
    desc: "order_page_delivery_type_options_yandex_delivery_desc",
  },
  noor_delivery: {
    label: "order_page_delivery_type_options_noor_delivery_label",
    desc: "order_page_delivery_type_options_noor_delivery_desc",
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
