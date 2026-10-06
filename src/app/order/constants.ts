import type { DeliveryType, OrderFormValues } from "@/types/order";
import type { CreateOrderPayload } from "@/apis/order";
import type { CartItemProps } from "@/types/cart";
import { getActiveCartLines } from "@/utils/cart";

export const defaultValues: OrderFormValues = {
  delivery_type: null,
  payment_type: null,
  branch: null,
  address: null,
  room: null,
  floor: null,
  entrance: null,
  comment: null,
  spend_cashback: false,
  promocode_id: null,
  promocode: null,
  total: null,
  shipping_date: null,
  shipping_time: null,
  delivery_price: null,
  delivery_price_type: null,
};

export const ONLINE_PAYMENT_TYPES = [
  "PAYME_API",
  "CLICK_API",
  "ROBO_CLICK",
  "ROBO_PAYME",
  "ROBO_UZUM",
];

export const ONLINE_PAYMENT_TYPE_NAMES: Record<string, string> = {
  PAYME_API: "Payme",
  CLICK_API: "Click",
  ROBO_CLICK: "Click",
  ROBO_PAYME: "Payme",
  ROBO_UZUM: "Uzum",
};

export const TELEGRAM_INVOICE_PAYMENT_TYPES = ["CLICK", "PAYME"] as const;

export type TelegramInvoicePaymentType =
  (typeof TELEGRAM_INVOICE_PAYMENT_TYPES)[number];

export const isTelegramInvoicePaymentType = (
  value: string,
): value is TelegramInvoicePaymentType =>
  (TELEGRAM_INVOICE_PAYMENT_TYPES as readonly string[]).includes(value);

export const buildShippingDatetime = (date: string | null, time: string | null) => {
  if (!date || !time) return null;

  return `${date}T${time}:00`;
};

export const isValidPaymentUrl = (url?: string | null): url is string => {
  if (!url) return false;

  try {
    const { protocol, hostname } = new URL(url);

    return (
      (protocol === "https:" || protocol === "http:") && hostname.includes(".")
    );
  } catch {
    return false;
  }
};

export const toDeliveryPrice = (value: number | string | null | undefined) => {
  if (value === null || value === undefined || value === "") return null;

  const price = Number(value);

  return Number.isNaN(price) ? null : price;
};

export type UnavailableState = {
  ids: number[];
  deliveryType: DeliveryType | null;
  branch: number | null;
};

type BuildOrderPayloadParams = {
  values: OrderFormValues;
  isDeliveryOrder: boolean;
  nearBranch: number | null;
  shopid: string;
  customerId: number;
  orderItems: number[];
  hasShippingTime: boolean;
};

export const buildOrderPayload = ({
  values,
  isDeliveryOrder,
  nearBranch,
  shopid,
  customerId,
  orderItems,
  hasShippingTime,
}: BuildOrderPayloadParams) => {
  const payload: CreateOrderPayload = {
    spend_cashback: values.spend_cashback,
    near_branch: nearBranch,
    shop: shopid,
    customer: Number(customerId),
    platform: "TELEGRAM",
    branch: isDeliveryOrder ? null : values.branch,
    payment_type: values.payment_type as string,
    service_type: values.delivery_type as string,
    is_paid: false,
    promo_code: values.promocode_id ?? undefined,
    items: orderItems,
    shipping_datetime: hasShippingTime
      ? buildShippingDatetime(values.shipping_date, values.shipping_time)
      : null,
    is_menu_button: false,
  };

  if (isDeliveryOrder && values.address !== null) {
    payload.address = {
      address: values.address,
      room: values.room,
      floor: values.floor,
      entrance: values.entrance,
      comment: values.comment?.trim() || null,
    };
  }

  return payload;
};

export const getOrderItems = (carts: CartItemProps[]) =>
  getActiveCartLines(carts).flatMap((item) =>
    typeof item.id === "number" ? [item.id] : [],
  );
