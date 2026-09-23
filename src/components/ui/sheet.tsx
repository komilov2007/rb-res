"use client";

import * as React from "react";
import { Dialog as SheetPrimitive } from "radix-ui";

import { cn } from "@/utils/cn";
import XButton from "@/components/ui/x-button";

function Sheet({ ...props }: React.ComponentProps<typeof SheetPrimitive.Root>) {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />;
}

function SheetTrigger({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Trigger>) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />;
}

function SheetClose({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Close>) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />;
}

function SheetPortal({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Portal>) {
  return <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />;
}

function SheetOverlay({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Overlay>) {
  return (
    <SheetPrimitive.Overlay
      data-slot="sheet-overlay"
      className={cn(
        "fixed inset-0 z-50 bg-black/20",
        "data-[state=open]:animate-in",
        "data-[state=open]:fade-in-0",
        "data-[state=closed]:animate-out",
        "data-[state=closed]:fade-out-0",
        "data-[state=open]:duration-200",
        "data-[state=closed]:duration-200",
        className,
      )}
      {...props}
    />
  );
}

function SheetContent({
  className,
  children,
  side = "right",
  showCloseButton = true,
  desktopModal = false,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Content> & {
  side?: "top" | "right" | "bottom" | "left";
  showCloseButton?: boolean;
  // Mobile keeps the sheet; from lg up it becomes a centered modal (the
  // side's position/slide classes are overridden, hence the "!").
  desktopModal?: boolean;
}) {
  return (
    <SheetPortal>
      <SheetOverlay />

      <SheetPrimitive.Content
        data-slot="sheet-content"
        data-side={side}
        className={cn(
          "fixed z-50 flex flex-col bg-white text-black shadow-lg outline-none",

          /*
           * RIGHT
           */
          "data-[side=right]:inset-y-0",
          "data-[side=right]:right-0",
          "data-[side=right]:h-full",
          "data-[side=right]:border-l",
          "data-[side=right]:border-gray180",

          /*
           * LEFT
           */
          "data-[side=left]:inset-y-0",
          "data-[side=left]:left-0",
          "data-[side=left]:h-full",
          "data-[side=left]:border-r",
          "data-[side=left]:border-gray180",

          /*
           * TOP
           */
          "data-[side=top]:inset-x-0",
          "data-[side=top]:top-0",
          "data-[side=top]:h-auto",
          "data-[side=top]:border-b",
          "data-[side=top]:border-gray180",

          /*
           * BOTTOM
           */
          "data-[side=bottom]:inset-x-0",
          "data-[side=bottom]:bottom-0",
          "data-[side=bottom]:h-auto",
          "data-[side=bottom]:border-t",
          "data-[side=bottom]:border-gray180",

          /*
           * COMMON ANIMATION
           */
          "data-[state=open]:animate-in",
          "data-[state=closed]:animate-out",

          "data-[state=open]:duration-200",
          "data-[state=closed]:duration-200",

          /*
           * OPEN
           */
          "data-[side=right]:data-[state=open]:slide-in-from-right-full",
          "data-[side=left]:data-[state=open]:slide-in-from-left-full",
          "data-[side=top]:data-[state=open]:slide-in-from-top-full",
          "data-[side=bottom]:data-[state=open]:slide-in-from-bottom-full",

          /*
           * CLOSE
           */
          "data-[side=right]:data-[state=closed]:slide-out-to-right-full",
          "data-[side=left]:data-[state=closed]:slide-out-to-left-full",
          "data-[side=top]:data-[state=closed]:slide-out-to-top-full",
          "data-[side=bottom]:data-[state=closed]:slide-out-to-bottom-full",

          /*
           * DESKTOP MODAL (opt-in)
           */
          desktopModal &&
            cn(
              "lg:inset-auto! lg:top-1/2! lg:left-1/2! lg:h-auto! lg:max-h-[85vh]!",
              "lg:w-[calc(100%-2rem)]! lg:max-w-md! lg:-translate-x-1/2 lg:-translate-y-1/2",
              "lg:rounded-2xl! lg:border! lg:border-gray180",
              "lg:data-[state=open]:slide-in-from-bottom-2! lg:data-[state=open]:zoom-in-95",
              "lg:data-[state=closed]:slide-out-to-bottom-2! lg:data-[state=closed]:zoom-out-95",
            ),

          className,
        )}
        {...props}
      >
        {children}

        {showCloseButton && (
          <SheetPrimitive.Close data-slot="sheet-close" asChild>
            <XButton size="sm" className="absolute right-4 top-4" />
          </SheetPrimitive.Close>
        )}
      </SheetPrimitive.Content>
    </SheetPortal>
  );
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-header"
      className={cn("flex flex-col gap-0.5 p-4", className)}
      {...props}
    />
  );
}

function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-footer"
      className={cn("mt-auto flex flex-col gap-2 p-4", className)}
      {...props}
    />
  );
}

function SheetTitle({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Title>) {
  return (
    <SheetPrimitive.Title
      data-slot="sheet-title"
      className={cn("text-base font-medium text-black", className)}
      {...props}
    />
  );
}

function SheetDescription({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Description>) {
  return (
    <SheetPrimitive.Description
      data-slot="sheet-description"
      className={cn("text-sm text-gray220", className)}
      {...props}
    />
  );
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
};
