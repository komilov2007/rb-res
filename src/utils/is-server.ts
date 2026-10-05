import { defaultLocale, locales, type LocaleProps } from "@/types/i18n";

export const isServer = () => {
  return typeof window === "undefined";
};

export const getShopIdFromUrl = () => {
  if (isServer()) return;

  return new URLSearchParams(window.location.search).get("shop_id");
};

export const getLanguage = (): LocaleProps => {
  if (isServer()) return defaultLocale;

  const cookieLocale = document.cookie.match(/(?:^|;\s*)NEXT_LOCALE=([^;]+)/)?.[1];

  return cookieLocale && locales.includes(cookieLocale as LocaleProps)
    ? (cookieLocale as LocaleProps)
    : defaultLocale;
};
