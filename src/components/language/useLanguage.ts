"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { languages, type LanguageValue } from "@/constants/language";
import { useGeneral } from "@/hooks/useGeneral";
import { defaultLocale } from "@/types/i18n";
import { setCookie } from "@/utils/cookie";

const isLanguage = (value: string): value is LanguageValue => value in languages;

export const useLanguage = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const locale = useLocale();
  const { data: general } = useGeneral();
  const [open, setOpen] = useState(false);
  const value: LanguageValue = isLanguage(locale) ? locale : defaultLocale;
  const shopLanguages = general?.data.languages?.filter(isLanguage);
  const availableLanguages: LanguageValue[] = shopLanguages?.length
    ? Array.from(new Set<LanguageValue>([defaultLocale, ...shopLanguages, value]))
    : ["uz", "ru", "en", "tr"];

  const handleChangeLanguage = (language: string) => {
    if (!isLanguage(language) || !availableLanguages.includes(language)) {
      return;
    }

    localStorage.setItem("language", language);
    setCookie("NEXT_LOCALE", language);
    router.refresh();
    void queryClient.invalidateQueries();
  };

  useEffect(() => {
    if (!open) return;

    const frame = requestAnimationFrame(() => {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
      document.documentElement.style.overflow = "";
    });

    return () => cancelAnimationFrame(frame);
  }, [open]);

  return {
    open,
    value,
    setOpen,
    safeValue: value,
    availableLanguages,
    handleChangeLanguage,
  };
};
