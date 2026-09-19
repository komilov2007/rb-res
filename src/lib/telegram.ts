import type { WebApp as TelegramWebApp } from "@twa-dev/types";

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

// @twa-dev/sdk reads `window.Telegram.WebApp` as a side effect at import
// time, which throws both during SSR and in any browser tab opened outside
// a real Telegram client. Always import it lazily, client-side, and only
// after confirming the WebApp global actually exists.
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

// Deliberately synchronous (reuses hasTelegramWebApp's plain global check
// rather than loadWebApp's dynamic import) so window.open/the anchor click
// below stay tied to the same tick as the caller's user gesture instead of
// risking a popup-blocker after an await.
export const openPaymentLink = (url: string) => {
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

// Telegram's own Bot API, not our backend — called directly from the
// client with the bot token our backend hands back, per the STEP 7 spec.
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
