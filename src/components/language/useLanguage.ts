"use client";

import { useGeneral } from "@/hooks/useGeneral";
import { setCookie } from "@/utils/cookie";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { languages, type LanguageValue } from "./language.constants";

export const useLanguage = () => {
  const router = useRouter();
  const { data: general } = useGeneral();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState<LanguageValue>(() => {
    if (typeof window === "undefined") return "uz";

    const language = localStorage.getItem("language") as LanguageValue | null;

    return language && languages[language] ? language : "uz";
  });
  const availableLanguages =
    (general?.data.languages?.filter(
      (language): language is LanguageValue => language in languages,
    ) as LanguageValue[] | undefined) ?? ["uz", "ru", "en"];
  const safeValue = availableLanguages.includes(value)
    ? value
    : availableLanguages[0];

  const handleChangeLanguage = (language: string) => {
    const newLanguage = language as LanguageValue;

    if (!availableLanguages.includes(newLanguage)) return;

    setValue(newLanguage);
    localStorage.setItem("language", newLanguage);
    setCookie("NEXT_LOCALE", newLanguage);
    router.refresh();
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
    safeValue,
    availableLanguages,
    handleChangeLanguage,
  };
};
