import { cookies, headers } from "next/headers";
import { defaultLocale, locales, type LocaleProps } from "@/types/i18n";

const asLocale = (value?: string | null) => {
  // "ru-RU,ru;q=0.9" / "ru-RU" / "ru" all resolve to "ru".
  const code = value?.split(",")[0]?.split("-")[0]?.trim().toLowerCase();

  return code && locales.includes(code as LocaleProps)
    ? (code as LocaleProps)
    : null;
};

export const getLocale = async () => {
  const headerList = await headers();
  // Click's superapp webview attaches `web-session` on every request it
  // makes. Inside Click there is no in-app language switcher (the Click
  // shell owns that choice), so the locale follows the device language it
  // sends in Accept-Language instead of our own NEXT_LOCALE cookie —
  // matching rb-shop's provider/provider.tsx.
  if (headerList.get("web-session")) {
    const detected = asLocale(headerList.get("accept-language"));

    if (detected) return detected;
  }

  return asLocale((await cookies()).get("NEXT_LOCALE")?.value) ?? defaultLocale;
};

export const getMessages = async (locale: LocaleProps) => {
  return (await import(`../../messages/${locale}.json`)).default;
};
