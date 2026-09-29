import { Check } from "lucide-react";

type RadioMarkProps = {
  checked: boolean;
  // md: branch/address lists; sm: order-page option cards.
  size?: "sm" | "md";
  // sm only: red ring on an unselected option when the field has an error.
  hasError?: boolean;
  className?: string;
};

// The one look for every radio-style option (row or card) in the app:
// borderless soft-gray surface, green outline + tint when selected, red
// outline when the field has an error. Callers add their own layout.
// "outlined": white card with a gray border instead of the gray surface —
// the order page's look (same as its payment-method cards).
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

// Circular selection indicator used by the app's radio-style option lists.
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
