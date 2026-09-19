"use client";

import {
  Select,
  SelectItem,
  SelectValue,
  SelectContent,
  SelectTrigger,
} from "@/components/ui/select";
import { languages } from "@/constants/language";
import { useLanguage } from "./useLanguage";

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
            ? "h-8 rounded-full bg-white/18 px-3 text-xs font-bold text-white backdrop-blur-md"
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

export default Language;
