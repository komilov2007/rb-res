"use client";

import { Check, ChevronRight } from "lucide-react";

import { PRIMARY_COLORS } from "@/constants/theme";
import { useThemeStore } from "@/stores/theme";

// Desktop-only left-edge panel to switch the site's primary colour. Hidden
// while any modal/drawer locks the page scroll; mobile is untouched.
const ThemeSwitcher = () => {
  const primaryColor = useThemeStore((state) => state.primaryColor);
  const setPrimaryColor = useThemeStore((state) => state.setPrimaryColor);
  const panelOpen = useThemeStore((state) => state.panelOpen);
  const togglePanel = useThemeStore((state) => state.togglePanel);

  return (
    <div
      className={`fixed left-0 top-1/2 z-[100] hidden -translate-y-1/2 items-center transition-transform duration-300 lg:flex [body[data-scroll-locked]_&]:hidden! ${
        panelOpen ? "translate-x-0" : "-translate-x-60"
      }`}
    >
      <div className="flex w-60 flex-col gap-1.5 rounded-r-2xl border border-l-0 border-gray180 bg-white p-2 shadow-[0_8px_30px_rgba(17,24,39,0.15)]">
        <span className="px-2 pt-1 text-[11px] uppercase tracking-wide text-gray220">
          Asosiy rang
        </span>
        <div className="grid grid-cols-6 gap-1.5 px-2 pb-1">
          {PRIMARY_COLORS.map((color) => (
            <button
              key={color.id}
              type="button"
              title={color.label}
              aria-label={color.label}
              onClick={() => setPrimaryColor(color.id)}
              style={{ backgroundColor: color.value }}
              className={`grid h-7 w-7 place-items-center rounded-full text-white transition-transform hover:scale-110 ${
                primaryColor === color.id
                  ? "ring-2 ring-gray180 ring-offset-2"
                  : ""
              }`}
            >
              {primaryColor === color.id && <Check size={14} />}
            </button>
          ))}
        </div>
      </div>
      <button
        type="button"
        onClick={togglePanel}
        className="-ml-px flex h-24 w-7 items-center justify-center rounded-r-xl border border-l-0 border-gray180 bg-white text-gray220 shadow-[4px_0_12px_rgba(17,24,39,0.08)] hover:text-primary"
        aria-label="Asosiy rang"
      >
        <ChevronRight
          size={16}
          className={`transition-transform ${panelOpen ? "rotate-180" : ""}`}
        />
      </button>
    </div>
  );
};

export default ThemeSwitcher;
