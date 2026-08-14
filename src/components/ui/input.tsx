import type { ComponentType, InputHTMLAttributes } from "react";
import { X } from "lucide-react";
import Button from "./button";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  IconStart?: ComponentType<{ size?: number; className?: string }>;
  IconEnd?: ComponentType;
  clearable?: boolean;
  onClear?: () => void;
};

const Input = ({
  IconStart,
  IconEnd,
  clearable,
  onClear,
  className = "",
  value,
  ...props
}: InputProps) => {
  const hasValue = String(value ?? "").length > 0;

  return (
    <div className="flex h-14 w-full items-center gap-3 rounded-2xl border border-transparent bg-[#F6F7F9] px-5 transition-colors duration-200 hover:border-gray180 focus-within:border-orange-200 focus-within:bg-white">
      {IconStart && <IconStart size={20} className="shrink-0 text-gray220" />}
      <input
        value={value}
        className={`w-full bg-transparent text-sm text-gray220 outline-none placeholder:text-gray220 ${className}`}
        {...props}
      />
      {clearable && hasValue && (
        <Button
          variant="soft"
          size="icon"
          onClick={onClear}
          className="h-[22px] w-[22px] rounded-full text-gray220 hover:text-black"
        >
          <X size={14} strokeWidth={2.4} />
        </Button>
      )}
      {IconEnd && <IconEnd />}
    </div>
  );
};

export default Input;
