import { IconFlagEnglish } from "@/assets/icons/flag-english";
import { IconFlagRussian } from "@/assets/icons/flag-russian";
import { IconFlagTurkish } from "@/assets/icons/flag-turkish";
import { IconFlagUzbek } from "@/assets/icons/flag-uzbek";

export const languages = {
  uz: { label: "O'zbek", short: "O'ZB", Icon: IconFlagUzbek },
  en: { label: "English", short: "ENG", Icon: IconFlagEnglish },
  ru: { label: "Russian", short: "RUS", Icon: IconFlagRussian },
  tr: { label: "Turkish", short: "TR", Icon: IconFlagTurkish },
};

export type LanguageValue = keyof typeof languages;
