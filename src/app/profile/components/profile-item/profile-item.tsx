import type { ComponentType, ReactNode } from "react";
import { ChevronRight } from "lucide-react";

// Mobile profile page's grouped menu card and its rows.
export const ProfileGroup = ({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={`mt-2 overflow-hidden rounded-2xl border border-gray180 bg-white ${className}`}
    >
      {children}
    </div>
  );
};

type ProfileItemProps = {
  icon: ComponentType<{ size?: number; className?: string }>;
  label: string;
  value?: string;
  onClick?: () => void;
};

export const ProfileItem = ({
  icon: Icon,
  label,
  value,
  onClick,
}: ProfileItemProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-11 w-full items-center gap-3 border-b border-gray180/60 px-2 text-left last:border-b-0"
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gray10 text-gray220">
        <Icon size={16} />
      </span>
      <span className="min-w-0 flex-1 truncate text-sm font-medium text-black">
        {label}
      </span>
      {value && (
        <span className="max-w-[110px] truncate text-xs font-medium text-gray220">
          {value}
        </span>
      )}
      <ChevronRight size={17} className="text-gray180" />
    </button>
  );
};
