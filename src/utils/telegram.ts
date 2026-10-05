import type { WebApp as TelegramWebApp } from "@twa-dev/types";

import { isClick } from "@/utils/click";

export type TelegramInvoiceStatus = "pending" | "failed" | "cancelled" | "paid";

type CreateInvoiceLinkParams = {
  title: string;
  description: string;
  payload: string;
  provider_token: string;
  currency: string;
  prices: { label: string; amount: number }[];
};

type CreateInvoiceLinkResult = {
  ok: boolean;
  result?: string;
  description?: string;
};

const hasTelegramWebApp = () =>
  typeof window !== "undefined" &&
  Boolean((window as { Telegram?: { WebApp?: unknown } }).Telegram?.WebApp);

const loadWebApp = async () => {
  if (!hasTelegramWebApp()) return null;

  const { default: WebApp } = await import("@twa-dev/sdk");

  return WebApp;
};

const getTelegramWebApp = (): TelegramWebApp | null => {
  if (!hasTelegramWebApp()) return null;

  return (window as unknown as { Telegram: { WebApp: TelegramWebApp } })
    .Telegram.WebApp;
};

const openLinkInBrowser = (url: string) => {
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.target = "_blank";
  anchor.rel = "noopener noreferrer";
  anchor.click();
};

export const openExternalLink = (url: string) => {
  const telegram = getTelegramWebApp();

  if (telegram) {
    if (navigator.platform.includes("Mac")) {
      window.open(url, "_blank");
    } else if (/Android/i.test(navigator.userAgent)) {
      openLinkInBrowser(url);
    } else {
      telegram.openLink(url);
    }
  } else {
    window.open(url, "_blank");
  }
};

export const openPaymentLink = (url: string) => {
  if (isClick()) {
    window.open(url, "_self");
    return;
  }

  openExternalLink(url);
};

export const sendTelegramData = async (data: unknown): Promise<boolean> => {
  const WebApp = await loadWebApp();

  if (!WebApp) return false;

  WebApp.sendData(JSON.stringify(data));

  return true;
};

export const openTelegramInvoice = async (
  url: string,
): Promise<TelegramInvoiceStatus | null> => {
  const WebApp = await loadWebApp();

  if (!WebApp) return null;

  return new Promise((resolve) => {
    WebApp.openInvoice(url, (status) => resolve(status));
  });
};

export const createTelegramInvoiceLink = async (
  botToken: string,
  params: CreateInvoiceLinkParams,
): Promise<CreateInvoiceLinkResult> => {
  const response = await fetch(
    `https://api.telegram.org/bot${botToken}/createInvoiceLink`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    },
  );

  return response.json();
};
