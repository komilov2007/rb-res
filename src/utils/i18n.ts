import { cookies } from "next/headers";
import { defaultLocale, locales, type LocaleProps } from "@/types/i18n";

export const getLocale = async () => {
  const cookieLocale = (await cookies()).get("NEXT_LOCALE")?.value;

  if (cookieLocale && locales.includes(cookieLocale as LocaleProps)) {
    return cookieLocale as LocaleProps;
  }

  return defaultLocale;
};

export const getMessages = async (locale: LocaleProps) => {
  return (await import(`../../messages/${locale}.json`)).default;
};
