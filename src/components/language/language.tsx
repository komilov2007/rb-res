"use client";

import {
  Select,
  SelectItem,
  SelectValue,
  SelectContent,
  SelectTrigger,
} from "@/components/ui/select";
import { useState } from "react";
import { IconFlagUzbek } from "@/icons/flag-uzbek";
import { IconFlagEnglish } from "@/icons/flag-english";
import { IconFlagRussian } from "@/icons/flag-russian";

const languages = {
  uz: { label: "O'zbek", short: "O'ZB", Icon: IconFlagUzbek },
  en: { label: "English", short: "ENG", Icon: IconFlagEnglish },
  ru: { label: "Russian", short: "RUS", Icon: IconFlagRussian },
};

type LanguageValue = keyof typeof languages;

const Language = () => {
  const [value, setValue] = useState<LanguageValue>("uz");
  const ActiveIcon = languages[value].Icon;

  return (
    <Select
      value={value}
      onValueChange={(language) => setValue(language as LanguageValue)}
    >
      <SelectTrigger>
        <ActiveIcon />
        <SelectValue>{languages[value].short}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {Object.entries(languages).map(([key, language]) => {
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

