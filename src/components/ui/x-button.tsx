"use client";

import type { ComponentProps } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
const xButtonVariants = cva(
  "inline-flex shrink-0 cursor-pointer items-center justify-center rounded-full bg-gray10 text-black transition-colors hover:bg-gray180 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      size: {
        sm: "h-8 w-8 [&_svg]:h-4 [&_svg]:w-4",
        lg: "h-10 w-10 [&_svg]:h-5 [&_svg]:w-5",
      },
    },
    defaultVariants: {
      size: "lg",
    },
  },
);

type XButtonProps = ComponentProps<"button"> &
  VariantProps<typeof xButtonVariants>;

const XButton = ({
  className,
  size,
  type = "button",
  "aria-label": ariaLabel = "Yopish",
  ...props
}: XButtonProps) => {
  return (
    <button
      type={type}
      aria-label={ariaLabel}
      className={cn(xButtonVariants({ size, className }))}
      {...props}
    >
      <X strokeWidth={2.2} />
    </button>
  );
};

export default XButton;
