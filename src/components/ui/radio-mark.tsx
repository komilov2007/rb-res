import { Check } from "lucide-react";

type RadioMarkProps = {
  checked: boolean;
  size?: "sm" | "md";
  hasError?: boolean;
  className?: string;
};

export const getOptionClassName = (
  checked: boolean,
  hasError = false,
  appearance: "soft" | "outlined" = "soft",
) => {
  const isOutlined = appearance === "outlined";

  return `border transition-colors duration-200 ${
    checked
      ? "border-green-500 bg-green-500/10"
      : hasError
        ? isOutlined
          ? "border-red bg-white"
          : "border-red bg-gray10/70"
        : isOutlined
          ? "border-gray180 bg-white"
          : "border-transparent bg-gray10/70 hover:bg-gray10"
  }`;
};

const RadioMark = ({
  checked,
  size = "md",
  hasError = false,
  className = "",
}: RadioMarkProps) => {
  if (size === "sm") {
    return (
      <span
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
          checked
            ? "border-green-500 bg-green-500"
            : hasError
              ? "border-red bg-white"
              : "border-gray180 bg-white"
        } ${className}`}
      >
        {checked && <Check size={12} strokeWidth={3} className="text-white" />}
      </span>
    );
  }

  return (
    <span
      className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 ${
        checked
          ? "border-green-500 bg-green-500 text-white"
          : "border-gray180 bg-white"
      }`}
    >
      {checked && <Check size={14} strokeWidth={3} />}
    </span>
  );
};

export default RadioMark;
