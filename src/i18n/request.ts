import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";
import type { LocaleProps } from "@/types/i18n";

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !routing.locales.includes(locale as LocaleProps)) {
    const cookieLocale = (await cookies()).get("NEXT_LOCALE")?.value;

    locale =
      cookieLocale && routing.locales.includes(cookieLocale as LocaleProps)
        ? cookieLocale
        : routing.defaultLocale;
  }

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
