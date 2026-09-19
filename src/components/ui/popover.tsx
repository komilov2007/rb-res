"use client";

import type { ComponentProps } from "react";
import { Arrow, Content, Portal, Root, Trigger } from "@radix-ui/react-popover";

const cn = (...classes: (string | undefined)[]) => {
  return classes.filter(Boolean).join(" ");
};

const Popover = (props: ComponentProps<typeof Root>) => {
  return <Root data-slot="popover" {...props} />;
};

const PopoverTrigger = (props: ComponentProps<typeof Trigger>) => {
  return <Trigger data-slot="popover-trigger" {...props} />;
};

const PopoverContent = ({
  className,
  align = "center",
  sideOffset = 4,
  ...props
}: ComponentProps<typeof Content>) => {
  return (
    <Portal>
      <Content
        data-slot="popover-content"
        align={align}
        sideOffset={sideOffset}
        className={cn(
          "z-50 origin-[var(--radix-popover-content-transform-origin)] rounded-xl border border-gray180 bg-white outline-none",
          className,
        )}
        {...props}
      />
    </Portal>
  );
};

export { Arrow as PopoverArrow, Popover, PopoverContent, PopoverTrigger };
