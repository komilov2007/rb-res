import type { ComponentProps } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "@radix-ui/react-slot";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap font-medium outline-none transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "rounded-lg bg-primary text-sm font-bold text-white hover:bg-primary/90",
        destructive: "rounded-lg bg-red/10 text-sm font-bold text-red",
        secondary: "rounded-xl bg-gray10 text-sm font-bold text-black",
        link: "text-sm font-medium text-black underline-offset-4 hover:underline",
        ghost:
          "rounded-xl bg-transparent text-sm font-medium text-black hover:bg-gray10",
        soft: "rounded-xl bg-gray10 text-sm font-bold text-black hover:bg-gray180",
        outline:
          "rounded-xl border border-gray180 bg-white text-sm font-bold text-black hover:bg-gray10",
        icon: "rounded-full border border-gray180 bg-white text-black hover:bg-gray10",
        nav: "rounded-xl text-sm font-medium text-gray220 counter-action:bg-gray10 hover:text-black",
        "icon-solid": "rounded-full bg-gray10 p-0 text-black hover:bg-gray180",
        "cart-solid":
          "rounded-xl bg-transparent px-3 text-black hover:bg-gray10",
        "product-add":
          "rounded-2xl border border-primary/10 bg-white text-sm font-bold text-primary  active:scale-[0.98]",
        counter:
          "overflow-hidden rounded-2xl border border-primary/10 bg-white p-1 text-primary",
        "counter-action":
          "shrink-0 overflow-hidden rounded-none p-0 text-lg font-bold text-primary active:scale-90",
        "counter-value":
          "shrink-0 rounded-none p-0 text-sm font-medium text-black active:scale-95",
        "sheet-close": "rounded-full bg-gray10 p-0 text-black hover:bg-gray180",
        "primary-solid":
          "rounded-xl bg-primary text-sm font-bold text-white hover:bg-primary/90",
        "floating-cart":
          "rounded-3xl bg-primary text-white shadow-[0_12px_32px_var(--black40)] active:scale-[0.98]",
        "cart-counter": "items-center bg-gray10 text-black",
        "cart-minus": "p-0 text-black hover:bg-gray180",
        "cart-plus": "p-0 text-primary hover:bg-primary10",
        "cart-trash": "bg-red/10 p-0 text-red hover:bg-red/15",
        clear: "rounded-full bg-gray10 p-0 text-gray220 hover:text-black",
        swiperNav:
          "rounded-full bg-gray180 text-black/70 shadow-sm active:scale-95",
        plain: "",
      },

      size: {
        default: "h-9 px-4",
        xs: "h-6 gap-1 px-2 text-xs",
        sm: "h-9 px-3 text-sm",
        md: "h-11 px-3 text-sm",
        lg: "h-12 px-4 text-sm",
        icon: "h-12 w-12 p-0",
        swiperNav: "h-9 w-9 p-0",
        none: "",
        "icon-xs": "h-6 w-6 p-0",
        "icon-sm": "h-7 w-7 p-0",
        "icon-lg": "h-9 w-9 p-0",
        clear: "h-[22px] w-[22px] p-0",
        productAdd: "h-10 w-full px-4 lg:h-11",
        counter: "h-10 w-full lg:h-11",
        counterItem: "h-8 w-8 lg:h-9 lg:w-9",
        sheetClose: "h-10 w-10 p-0",
        primaryFit: "h-11 px-6",
        primaryWide: "h-12 w-full px-5",
        floatingCart: "h-16 w-full justify-start px-4",
        floatingCartDesktop: "h-16 min-w-[250px] justify-start px-4",
        dialogAction: "h-11 flex-1",
        cartCounter: "h-10 rounded-xl p-1",
        cartCounterMobile: "h-9 rounded-full px-1",
        cartAction: "h-8 w-8 rounded-lg",
        cartActionMobile: "h-7 w-7 rounded-full",
        cartTrash: "h-10 w-10 rounded-xl",
        cartTrashMobile: "h-9 w-9 rounded-full",
      },
    },

    defaultVariants: {
      variant: "ghost",
      size: "md",
    },
  },
);

type ButtonProps = ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

function Button({
  className,
  variant = "ghost",
  size = "md",
  asChild = false,
  type = "button",
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      type={asChild ? undefined : type}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };

export default Button;
