import type { ComponentType, InputHTMLAttributes } from "react";
import { X } from "lucide-react";

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
    <div className="flex h-11 w-full items-center gap-3 rounded-lg border border-gray180 bg-white px-4">
      {IconStart && <IconStart size={20} className="shrink-0 text-gray220" />}
      <input
        value={value}
        className={`w-full bg-transparent text-sm text-gray220 outline-none placeholder:text-gray220 ${className}`}
        {...props}
      />
      {clearable && hasValue && (
        <button
          type="button"
          onClick={onClear}
          className="grid h-[22px] w-[22px] shrink-0 place-items-center rounded-full bg-gray10 text-gray220 transition-colors duration-200 hover:bg-gray180 hover:text-black"
        >
          <X size={14} strokeWidth={2.4} />
        </button>
      )}
      {IconEnd && <IconEnd />}
    </div>
  );
};

export default Input;
