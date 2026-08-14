import { createNavigation } from "next-intl/navigation";
import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["uz", "ru", "en"],
  defaultLocale: "uz",
  alternateLinks: false,
  localeDetection: false,
  localePrefix: "as-needed",
});

export const { Link, redirect, useRouter, usePathname, getPathname } =
  createNavigation(routing);
