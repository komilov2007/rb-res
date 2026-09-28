"use client";

import { Check, ChevronLeft, Palette } from "lucide-react";

import { PRIMARY_COLORS } from "@/constants/theme";
import { useThemeStore } from "@/stores/theme";

// Desktop-only left-edge card to switch the site's primary colour: the
// swatches and the collapse handle are one piece, so tucking it away leaves
// just the handle. Hidden while any modal/drawer locks the page scroll;
// mobile is untouched.
const ThemeSwitcher = () => {
  const primaryColor = useThemeStore((state) => state.primaryColor);
  const setPrimaryColor = useThemeStore((state) => state.setPrimaryColor);
  const panelOpen = useThemeStore((state) => state.panelOpen);
  const togglePanel = useThemeStore((state) => state.togglePanel);
  const selected =
    PRIMARY_COLORS.find((color) => color.id === primaryColor) ??
    PRIMARY_COLORS[0];

  return (
    <div
      className={`fixed left-0 top-1/2 z-[100] hidden -translate-y-1/2 items-stretch overflow-hidden rounded-r-2xl border border-l-0 border-gray180 bg-white shadow-[0_12px_32px_rgba(17,24,39,0.14)] transition-transform duration-300 lg:flex [body[data-scroll-locked]_&]:hidden! ${
        panelOpen ? "translate-x-0" : "-translate-x-58"
      }`}
    >
      <div className="flex w-58 flex-col gap-3 p-4">
        <div className="flex items-center gap-2.5">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary10 text-primary">
            <Palette size={16} />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-medium leading-4 text-black">
              Asosiy rang
            </p>
            <p className="mt-0.5 truncate text-xs leading-4 text-gray220">
              {selected.label}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          {PRIMARY_COLORS.map((color) => {
            const isActive = color.id === primaryColor;

            return (
              <button
                key={color.id}
                type="button"
                title={color.label}
                aria-label={color.label}
                aria-pressed={isActive}
                onClick={() => setPrimaryColor(color.id)}
                style={{
                  backgroundColor: color.value,
                  // White gap + a ring in the swatch's own colour
                  boxShadow: isActive
                    ? `0 0 0 2px #fff, 0 0 0 4px ${color.value}`
                    : undefined,
                }}
                className="grid h-7 w-7 place-items-center rounded-full text-white transition-transform hover:scale-110"
              >
                {isActive && <Check size={14} strokeWidth={3} />}
              </button>
            );
          })}
        </div>
      </div>

      <button
        type="button"
        onClick={togglePanel}
        aria-label="Asosiy rang"
        aria-expanded={panelOpen}
        className="flex w-7 shrink-0 items-center justify-center border-l border-gray180 text-gray220 transition-colors hover:bg-gray10 hover:text-primary"
      >
        <ChevronLeft
          size={16}
          className={`transition-transform duration-300 ${panelOpen ? "" : "rotate-180"}`}
        />
      </button>
    </div>
  );
};

export default ThemeSwitcher;
