import type { ComponentType, ReactNode } from "react";

type IconType = ComponentType<{ size?: number }>;

export const tileClassName = (hasError = false) =>
  `flex min-h-13 w-full items-center gap-2.5 rounded-xl border bg-white px-2.5 py-1.5 text-left transition-colors focus-within:border-primary data-[state=open]:border-primary ${
    hasError ? "border-red" : "border-gray180/60"
  }`;

export const TileIcon = ({ Icon }: { Icon: IconType }) => (
  <span className="flex w-6 shrink-0 items-center justify-center text-gray220">
    <Icon size={18} />
  </span>
);

export const TileLabel = ({ children }: { children: ReactNode }) => (
  <span className="block text-[11px] font-normal leading-4 text-gray220/70">{children}</span>
);

export const TileError = ({ message }: { message?: string }) =>
  message ? (
    <span className="mt-1 block px-1 text-xs text-red">{message}</span>
  ) : null;

type TwoFieldProps = {
  Icon: IconType;
  label: ReactNode;
  children: ReactNode;
  end?: ReactNode;
  error?: string;
};

// Variant two's form tile: primary icon badge, small label, value under
// it, optional trailing slot. Every field on the page uses this shape
// (selects build the same shape inside their trigger).
const TwoField = ({ Icon, label, children, end, error }: TwoFieldProps) => (
  <div>
    <div className={tileClassName(Boolean(error))}>
      <TileIcon Icon={Icon} />
      <div className="min-w-0 flex-1">
        <TileLabel>{label}</TileLabel>
        {children}
      </div>
      {end}
    </div>
    <TileError message={error} />
  </div>
);

export default TwoField;
