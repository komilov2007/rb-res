import { defaultLocale, locales, type LocaleProps } from "@/types/i18n";

export const isServer = () => {
  return typeof window === "undefined";
};

// The current shop, read straight from the URL — for code outside React
// (request interceptor, API functions). Inside components/hooks use
// useShopId() instead, which re-renders on navigation.
export const getShopIdFromUrl = () => {
  if (isServer()) return;

  return new URLSearchParams(window.location.search).get("shop_id");
};

// API Accept-Language — same source as the UI locale: the NEXT_LOCALE cookie
// set by the language switcher (the app has no /uz-style path segment).
export const getLanguage = (): LocaleProps => {
  if (isServer()) return defaultLocale;

  const cookieLocale = document.cookie.match(/(?:^|;\s*)NEXT_LOCALE=([^;]+)/)?.[1];

  return cookieLocale && locales.includes(cookieLocale as LocaleProps)
    ? (cookieLocale as LocaleProps)
    : defaultLocale;
};
