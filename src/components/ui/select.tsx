"use client";

import { Check, ChevronDown } from "lucide-react";
import type { ComponentProps } from "react";
import {
  Item,
  Icon,
  Root,
  Group,
  Value,
  Label,
  Portal,
  Trigger,
  Content,
  Viewport,
  ItemText,
  Separator,
  ItemIndicator,
  ScrollUpButton,
  ScrollDownButton,
} from "@radix-ui/react-select";

const Select = (props: ComponentProps<typeof Root>) => {
  return <Root {...props} />;
};

const SelectValue = (props: ComponentProps<typeof Value>) => {
  return <Value {...props} />;
};

const SelectTrigger = ({
  className = "",
  children,
  ...props
}: ComponentProps<typeof Trigger>) => {
  return (
    <Trigger
      className={`flex h-10 items-center gap-2 rounded-lg bg-gray10 px-3 text-sm font-semibold text-gray220 outline-none ${className}`}
      {...props}
    >
      {children}
      <Icon asChild>
        <ChevronDown size={15} className="text-gray220" />
      </Icon>
    </Trigger>
  );
};

const SelectContent = ({
  className = "",
  children,
  ...props
}: ComponentProps<typeof Content>) => {
  return (
    <Portal>
      <Content
        position="popper"
        sideOffset={8}
        className={`z-50 min-w-[132px] overflow-hidden rounded-lg border border-gray180 bg-white ${className}`}
        {...props}
      >
        <Viewport className="p-1">{children}</Viewport>
      </Content>
    </Portal>
  );
};

const SelectItem = ({
  className = "",
  children,
  ...props
}: ComponentProps<typeof Item>) => {
  return (
    <Item
      className={`relative flex cursor-pointer select-none items-center rounded-md px-3 py-2 pr-8 text-sm outline-none hover:bg-gray10 data-[highlighted]:bg-gray10 ${className}`}
      {...props}
    >
      <ItemText>{children}</ItemText>
      <ItemIndicator className="absolute right-2">
        <Check size={16} className="text-blue30" />
      </ItemIndicator>
    </Item>
  );
};

const SelectGroup = (props: ComponentProps<typeof Group>) => {
  return <Group {...props} />;
};

const SelectLabel = (props: ComponentProps<typeof Label>) => {
  return <Label {...props} />;
};

const SelectSeparator = (props: ComponentProps<typeof Separator>) => {
  return <Separator {...props} />;
};

const SelectScrollUpButton = (props: ComponentProps<typeof ScrollUpButton>) => {
  return <ScrollUpButton {...props} />;
};

const SelectScrollDownButton = (
  props: ComponentProps<typeof ScrollDownButton>,
) => {
  return <ScrollDownButton {...props} />;
};

export {
  Select,
  SelectItem,
  SelectGroup,
  SelectLabel,
  SelectValue,
  SelectContent,
  SelectTrigger,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
};
