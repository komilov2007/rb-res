import { cookies, headers } from "next/headers";
import { defaultLocale, locales, type LocaleProps } from "@/types/i18n";

const asLocale = (value?: string | null) => {
  const code = value?.split(",")[0]?.split("-")[0]?.trim().toLowerCase();

  return code && locales.includes(code as LocaleProps)
    ? (code as LocaleProps)
    : null;
};

export const getLocale = async () => {
  const headerList = await headers();
  if (headerList.get("web-session")) {
    const detected = asLocale(headerList.get("accept-language"));

    if (detected) return detected;
  }

  return asLocale((await cookies()).get("NEXT_LOCALE")?.value) ?? defaultLocale;
};

export const getMessages = async (locale: LocaleProps) => {
  return (await import(`../../messages/${locale}.json`)).default;
};
