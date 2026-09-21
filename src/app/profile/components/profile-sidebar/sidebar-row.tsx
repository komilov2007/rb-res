import type { ComponentType } from "react";
import { ChevronRight } from "lucide-react";

type SidebarRowProps = {
  icon: ComponentType<{ size?: number }>;
  label: string;
  value?: string;
  active?: boolean;
  onClick: () => void;
};

// One menu row of the desktop profile sidebar: an inset rounded row
// inside its group card (see SIDEBAR_GROUP_CLASS_NAME). Hover lifts it on
// grey and nudges the chevron; the current route's row gets a soft primary
// tint only — icon and text stay as they are.
const SidebarRow = ({
  icon: Icon,
  label,
  value,
  active,
  onClick,
}: SidebarRowProps) => (
  <button
    type="button"
    onClick={onClick}
    aria-current={active ? "page" : undefined}
    className={`group flex h-11 w-full shrink-0 items-center gap-3 rounded-xl px-2 text-left outline-none transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-primary/40 ${
      active ? "bg-primary10 text-black" : "text-black hover:bg-gray10"
    }`}
  >
    <span
      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors duration-150 ${
        active
          ? "bg-white text-gray220"
          : "bg-gray10 text-gray220 group-hover:bg-white group-hover:text-black"
      }`}
    >
      <Icon size={16} />
    </span>
    <span className="min-w-0 flex-1 truncate text-sm font-medium">
      {label}
    </span>
    {value && (
      <span className="max-w-25 truncate text-xs font-medium text-gray220">
        {value}
      </span>
    )}
    <ChevronRight
      size={17}
      className={`shrink-0 transition-transform duration-150 group-hover:translate-x-0.5 ${
        active ? "text-gray220" : "text-gray180 group-hover:text-gray220"
      }`}
    />
  </button>
);

// The card SidebarRows sit in: padded so the rows' own rounded hover and
// active backgrounds stay inset instead of running into the card edges.
export const SIDEBAR_GROUP_CLASS_NAME =
  "flex flex-col gap-0.5 rounded-2xl border border-gray180 bg-white p-1.5";

export default SidebarRow;
