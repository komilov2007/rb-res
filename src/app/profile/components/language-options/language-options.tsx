"use client";

import { Check } from "lucide-react";

import { useLanguage } from "@/components/language/useLanguage";
import { languages } from "@/constants/language";

type LanguageOptionsProps = {
  // Called after the language has been switched (e.g. to close a sheet).
  onSelect?: () => void;
};

// The language list itself — shared by the mobile LanguageSheet and the
// desktop /profile/language page. Same switching logic as the header's
// language select (useLanguage): cookie + localStorage, then refresh.
const LanguageOptions = ({ onSelect }: LanguageOptionsProps) => {
  const { safeValue, availableLanguages, handleChangeLanguage } = useLanguage();

  return availableLanguages.map((key) => {
    const language = languages[key];
    const Icon = language.Icon;
    const checked = key === safeValue;

    return (
      <button
        key={key}
        type="button"
        data-language={key}
        onClick={() => {
          handleChangeLanguage(key);
          onSelect?.();
        }}
        className={`flex h-11 items-center gap-3 rounded-xl border px-3 text-left transition-colors ${
          checked ? "border-green-500 bg-green-500/10" : "border-gray180"
        }`}
      >
        <Icon />
        <span className="flex-1 text-sm font-medium text-black">
          {language.label}
        </span>
        <span
          className={`grid h-5 w-5 place-items-center rounded-full border-2 ${
            checked
              ? "border-green-500 bg-green-500 text-white"
              : "border-gray180"
          }`}
        >
          {checked && <Check size={12} strokeWidth={3} />}
        </span>
      </button>
    );
  });
};

export default LanguageOptions;
