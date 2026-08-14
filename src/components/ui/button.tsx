import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "ghost" | "soft" | "outline" | "icon" | "nav" | "plain";
type ButtonSize = "sm" | "md" | "lg" | "icon" | "none";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
};

const variantClasses: Record<ButtonVariant, string> = {
  ghost: "bg-transparent text-black hover:bg-gray10",
  soft: "bg-gray10 text-black hover:bg-gray180",
  outline:
    "border border-gray180 bg-white text-black hover:border-primary/30 hover:bg-primary10",
  icon: "rounded-full border border-gray180 bg-white text-black hover:border-primary/30 hover:bg-gray10",
  nav: "text-gray220 hover:text-primary",
  plain: "",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-3 text-sm",
  lg: "h-12 px-4 text-sm",
  icon: "h-12 w-12 p-0",
  none: "",
};

const Button = ({
  variant = "ghost",
  size = "md",
  type = "button",
  className = "",
  children,
  ...props
}: ButtonProps) => {
  return (
    <button
      type={type}
      className={joinClasses(
        "inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl font-semibold outline-none transition-colors duration-200 disabled:pointer-events-none disabled:opacity-50",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
};

const joinClasses = (...classes: Array<string | false | null | undefined>) => {
  return classes.filter(Boolean).join(" ");
};

export default Button;
