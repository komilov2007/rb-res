import { IconFlagEnglish } from "@/icons/flag-english";
import { IconFlagRussian } from "@/icons/flag-russian";
import { IconFlagUzbek } from "@/icons/flag-uzbek";

export const languages = {
  uz: { label: "O'zbek", short: "O'ZB", Icon: IconFlagUzbek },
  en: { label: "English", short: "ENG", Icon: IconFlagEnglish },
  ru: { label: "Russian", short: "RUS", Icon: IconFlagRussian },
};

export type LanguageValue = keyof typeof languages;
