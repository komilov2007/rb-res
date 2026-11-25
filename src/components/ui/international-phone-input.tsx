"use client";

import { ChevronDown } from "lucide-react";
import {
  defaultCountries,
  FlagImage,
  parseCountry,
  usePhoneInput,
} from "react-international-phone";

import { Input } from "./input";

// Countries allowed at login — same list as rb-webapp
// components/inputs/input-phone/counties.ts.
const COUNTRY_CODES = [
  "uz", "ru", "kz", "kg", "tj", "tm", "az", "tr", "kr", "cn", "us", "al",
  "me", "sn", "ge", "zw", "tz", "ly", "cm", "md", "lb", "am", "ao", "nl",
  "cd", "sa", "cf", "za", "ss", "ch", "dk", "be", "jo", "gr", "kw", "hr",
  "pl", "rs", "ng", "bg", "sk", "lt", "ke", "ma", "cy", "ro", "qa", "fr",
  "tn", "gh", "de", "ua", "mk", "iq", "dz", "na", "by", "ye", "ba", "om",
  "lv", "cg",
];

const COUNTRIES = defaultCountries.filter((country) =>
  COUNTRY_CODES.includes(parseCountry(country).iso2),
);

type InternationalPhoneInputProps = {
  // Full international value, e.g. "+998 90 123 45 67"
  value: string;
  onChange: (value: string) => void;
  autoFocus?: boolean;
  wrapperClassName?: string;
};

// Digits of the number without the country dial code.
export const getNationalDigits = (phone: string, dialCode: string) =>
  phone.replace(/\D/g, "").slice(dialCode.length);

const InternationalPhoneInput = ({
  value,
  onChange,
  autoFocus,
  wrapperClassName = "max-h-12",
}: InternationalPhoneInputProps) => {
  const { inputValue, handlePhoneValueChange, inputRef, country, setCountry } =
    usePhoneInput({
      defaultCountry: "uz",
      value,
      countries: COUNTRIES,
      onChange: (data) => onChange(data.phone),
    });

  return (
    <Input
      ref={inputRef}
      autoFocus={autoFocus}
      type="tel"
      inputMode="tel"
      autoComplete="tel"
      value={inputValue}
      onChange={handlePhoneValueChange}
      wrapperClassName={`${wrapperClassName} px-4`}
      className="font-normal text-black"
      startContent={
        <label className="relative flex shrink-0 items-center gap-1">
          <FlagImage iso2={country.iso2} size="22px" />
          <ChevronDown size={14} className="text-gray220" />
          {/* Native select: mobil'da tizim ro'yxati ochiladi */}
          <select
            aria-label={country.name}
            value={country.iso2}
            onChange={(event) => setCountry(event.target.value)}
            className="absolute inset-0 cursor-pointer opacity-0"
          >
            {COUNTRIES.map((item) => {
              const parsed = parseCountry(item);
              return (
                <option key={parsed.iso2} value={parsed.iso2}>
                  {parsed.name} +{parsed.dialCode}
                </option>
              );
            })}
          </select>
        </label>
      }
    />
  );
};

export default InternationalPhoneInput;
