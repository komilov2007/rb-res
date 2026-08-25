import type { ComponentType, InputHTMLAttributes, ReactNode } from "react";
import { X } from "lucide-react";
import Button from "./button";

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
        className={`w-full bg-transparent text-sm text-gray220 outline-none placeholder:text-gray220 ${className}`}
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

export default Input;
