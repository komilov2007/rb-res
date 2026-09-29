"use client";

import type { ChangeEvent } from "react";

import Input from "@/components/ui/input";
import { IconFlagUzbek } from "@/assets/icons/flag-uzbek";
import { formatPhone, getDigits } from "@/utils/format-number";

type PhoneInputProps = {
  value: string;
  onChange: (value: string) => void;
  autoFocus?: boolean;
  wrapperClassName?: string;
};

const PhoneInput = ({
  value,
  onChange,
  autoFocus,
  wrapperClassName = "max-h-12",
}: PhoneInputProps) => {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const digits = getDigits(event.target.value, 9);

    onChange(digits);
  };

  return (
    <Input
      autoFocus={autoFocus}
      value={formatPhone(value)}
      onChange={handleChange}
      inputMode="numeric"
      autoComplete="tel"
      wrapperClassName={`${wrapperClassName} px-4`}
      className="font-normal text-black"
      startContent={
        <>
          <span className="flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden">
            <IconFlagUzbek />
          </span>
          <span className="shrink-0 text-sm font-medium text-black">+998</span>
        </>
      }
    />
  );
};

export default PhoneInput;
