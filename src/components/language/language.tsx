"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { languages, type LanguageValue } from "@/constants/language";
import { useGeneral } from "@/hooks/useGeneral";
import { defaultLocale } from "@/types/i18n";
import { setCookie } from "@/utils/cookie";
import { Select, SelectItem, SelectValue, SelectContent, SelectTrigger } from "@/components/ui/select";

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

type LanguageProps = {
  variant?: "default" | "hero" | "topbar";
};

const Language = ({ variant = "default" }: LanguageProps) => {
  const {
    open,
    value,
    setOpen,
    safeValue,
    availableLanguages,
    handleChangeLanguage,
  } = useLanguage();
  const ActiveIcon = languages[safeValue].Icon;
  const isHero = variant === "hero";
  const isTopbar = variant === "topbar";

  return (
    <Select
      value={value}
      open={open}
      onOpenChange={setOpen}
      onValueChange={handleChangeLanguage}
    >
      <SelectTrigger
        className={
          isHero
            ? "h-8 rounded-full bg-white/18 px-3 text-xs font-medium text-white backdrop-blur-md"
            : isTopbar
              ? "h-9 rounded-full bg-transparent px-0 text-sm font-medium text-black hover:bg-transparent"
            : "h-12 rounded-2xl bg-white px-3 text-black hover:bg-gray10"
        }
      >
        <ActiveIcon />
        <SelectValue>
          {isHero
            ? safeValue.toUpperCase()
            : isTopbar
              ? languages[safeValue].label
              : languages[safeValue].short}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {availableLanguages.map((key) => {
          const language = languages[key];
          const Icon = language.Icon;

          return (
            <SelectItem key={key} value={key}>
              <span className="flex items-center gap-2">
                <Icon />
                <span className="font-medium text-gray220">
                  {language.label}
                </span>
              </span>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
};

export { Language };

export default Language;
