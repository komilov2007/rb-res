"use client";

import type { ComponentType, InputHTMLAttributes, ReactNode, ChangeEvent } from "react";
import { X } from "lucide-react";
import Button from "./button";
import { IconFlagUzbek } from "@/assets/icons/flag-uzbek";
import { formatPhone, getDigits } from "@/utils/format-number";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  IconStart?: ComponentType<{ size?: number; className?: string }>;
  IconEnd?: ComponentType;
  startContent?: ReactNode;
  endContent?: ReactNode;
  clearable?: boolean;
  onClear?: () => void;
  wrapperClassName?: string;
};

const Input = ({
  IconStart,
  IconEnd,
  startContent,
  endContent,
  clearable,
  onClear,
  className = "",
  wrapperClassName = "",
  value,
  ...props
}: InputProps) => {
  const hasValue = String(value ?? "").length > 0;

  return (
    <div
      className={`flex h-14 w-full items-center gap-3 rounded-2xl border border-transparent bg-[#F6F7F9] px-5 transition-colors duration-200 hover:border-gray180 focus-within:border-orange-200 focus-within:bg-white ${wrapperClassName}`}
    >
      {IconStart && <IconStart size={20} className="shrink-0 text-gray220" />}
      {startContent}
      <input
        value={value}
        className={`w-full bg-transparent text-base text-gray220 outline-none placeholder:text-gray220 ${className}`}
        {...props}
      />
      {clearable && hasValue && (
        <Button variant="clear" size="clear" onClick={onClear}>
          <X size={14} strokeWidth={2.4} />
        </Button>
      )}
      {IconEnd && <IconEnd />}
      {endContent}
    </div>
  );
};

export const Loader = () => {
  return (
    <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-gray180 border-t-primary" />
  );
};

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

export { PhoneInput, Input };

export default Input;
