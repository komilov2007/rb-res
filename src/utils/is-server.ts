export const isServer = () => {
  return typeof window === "undefined";
};

const LANGUAGES = ["uz", "ru", "en", "tr"];

// API Accept-Language — same source as the UI locale: the NEXT_LOCALE cookie
// set by the language switcher (the app has no /uz-style path segment).
export const getLanguage = () => {
  if (isServer()) return "uz";

  const cookieLocale = document.cookie.match(/(?:^|;\s*)NEXT_LOCALE=([^;]+)/)?.[1];

  return cookieLocale && LANGUAGES.includes(cookieLocale) ? cookieLocale : "uz";
};
