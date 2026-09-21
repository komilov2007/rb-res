import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["uz", "ru", "en", "tr"],
  defaultLocale: "uz",
  alternateLinks: false,
  localeDetection: false,
  localePrefix: "as-needed",
});
