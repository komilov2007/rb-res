import { IconFlagEnglish } from "@/icons/flag-english";
import { IconFlagRussian } from "@/icons/flag-russian";
import { IconFlagUzbek } from "@/icons/flag-uzbek";
import { Globe2 } from "lucide-react";

export const languages = {
  uz: { label: "O'zbek", short: "O'ZB", Icon: IconFlagUzbek },
  en: { label: "English", short: "ENG", Icon: IconFlagEnglish },
  ru: { label: "Russian", short: "RUS", Icon: IconFlagRussian },
  tr: { label: "Turkish", short: "TR", Icon: Globe2 },
};

export type LanguageValue = keyof typeof languages;
