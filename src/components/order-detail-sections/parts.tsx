import type { ReactNode } from "react";

export const SectionLabel = ({
  icon,
  children,
}: {
  icon: ReactNode;
  children: ReactNode;
}) => (
  <div className="flex items-center gap-2 text-[11px] font-normal tracking-wide text-black/90 ">
    {icon}
    {children}
  </div>
);

export const InfoRow = ({
  label,
  value,
  valueClassName = "text-black",
}: {
  label: string;
  value: ReactNode;
  valueClassName?: string;
}) => (
  <div className="flex items-center justify-between text-sm">
    <span className="font-medium text-gray220">{label}</span>
    <span className={`font-medium ${valueClassName}`}>{value}</span>
  </div>
);
