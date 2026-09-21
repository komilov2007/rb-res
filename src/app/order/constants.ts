"use client";

import type { DeliveryType, OrderFormValues } from "@/types/order";

// delivery_type starts empty: it's set to the first service the shop offers
// (general.services) once general data is available — see the effect below.
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

// Payment types that finish in an external payment page via createOrder's
// url.url redirect.
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

// Group B — these go through the Telegram invoice flow (token -> Telegram
// Bot API createInvoiceLink -> openInvoice) instead of createOrder's own
// url.url redirect. Everything else that isn't in ONLINE_PAYMENT_TYPES
// (Group C) is Group A — direct createOrder, no redirect, no invoice.
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

// The backend has returned `url: null` when a provider isn't enabled for the
// shop — anything that isn't a real absolute http(s) link can't be opened.
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
  // Unavailability is reported for a specific service/branch — once either
  // changes the ids no longer apply.
  deliveryType: DeliveryType | null;
  branch: number | null;
};
