import type { DeliveryType, OrderFormValues } from "@/types/order";

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
