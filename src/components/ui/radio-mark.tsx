import { Check } from "lucide-react";

type RadioMarkProps = {
  checked: boolean;
  // md: branch/address lists; sm: order-page option cards.
  size?: "sm" | "md";
  // sm only: red ring on an unselected option when the field has an error.
  hasError?: boolean;
  className?: string;
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
              ? "border-red"
              : "border-gray180"
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
