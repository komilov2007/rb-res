"use client";

import RadioMark, { getOptionClassName } from "@/components/ui/radio-mark";

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
        className={`flex h-12 items-center gap-3 rounded-2xl px-3 text-left ${getOptionClassName(checked)}`}
      >
        <Icon />
        <span className="flex-1 text-sm font-normal text-black">
          {language.label}
        </span>
        <RadioMark checked={checked} />
      </button>
    );
  });
};

export default LanguageOptions;
