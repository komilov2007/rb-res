"use client";

import { ChevronDown, LayoutGrid } from "lucide-react";

import AtmosphereDesktop from "../atmosphere-desktop";
import {
  ATMOSPHERE_PREVIEW_VARIANTS,
  useAtmospherePreviewStore,
} from "./store";
import {
  Chapters,
  CinemaHero,
  Editorial,
  StickySplit,
  type DesktopVariantProps,
} from "./variants";

// TEMPORARY — renders the picked desktop layout (0 = current
// AtmosphereDesktop) plus a bottom-centre switcher.
// Keyed by the variant ids in ATMOSPHERE_PREVIEW_VARIANTS.
const VARIANTS: Record<
  number,
  (props: DesktopVariantProps) => React.ReactNode
> = {
  0: AtmosphereDesktop,
  1: StickySplit,
  2: CinemaHero,
  4: Editorial,
  5: Chapters,
};

// Bottom-centre bar (the orders preview panel already owns the left edge);
// collapses to one small button.
const Switcher = () => {
  const variant = useAtmospherePreviewStore((state) => state.variant);
  const setVariant = useAtmospherePreviewStore((state) => state.setVariant);
  const panelOpen = useAtmospherePreviewStore((state) => state.panelOpen);
  const togglePanel = useAtmospherePreviewStore((state) => state.togglePanel);

  return (
    <div className="fixed bottom-5 left-1/2 z-[100] flex -translate-x-1/2 items-center gap-1 rounded-2xl border border-gray180 bg-white p-1.5 shadow-[0_8px_30px_rgba(17,24,39,0.18)]">
      <button
        type="button"
        onClick={togglePanel}
        className="flex h-9 items-center gap-1.5 rounded-xl px-3 text-sm text-gray220 hover:bg-gray10"
      >
        <LayoutGrid size={16} />
        {!panelOpen && `Atmosfera: ${variant}`}
        <ChevronDown
          size={14}
          className={`transition-transform ${panelOpen ? "-rotate-90" : "rotate-90"}`}
        />
      </button>
      {/* Numbers only so the bar fits any desktop width; the picked
          variant's name is spelled out after them. */}
      {panelOpen && (
        <>
          {ATMOSPHERE_PREVIEW_VARIANTS.map((item) => (
            <button
              key={item.id}
              type="button"
              title={item.label}
              onClick={() => setVariant(item.id)}
              className={`h-9 w-9 rounded-xl text-sm transition-colors ${
                variant === item.id
                  ? "bg-primary text-white"
                  : "text-black hover:bg-gray10"
              }`}
            >
              {item.id}
            </button>
          ))}
          <span className="whitespace-nowrap px-3 text-sm text-primary">
            {
              ATMOSPHERE_PREVIEW_VARIANTS.find((item) => item.id === variant)
                ?.label
            }
          </span>
        </>
      )}
    </div>
  );
};

const AtmosphereDesktopPreview = (props: DesktopVariantProps) => {
  const variant = useAtmospherePreviewStore((state) => state.variant);
  const Variant = VARIANTS[variant] ?? AtmosphereDesktop;

  return (
    <>
      <Variant {...props} />
      <Switcher />
    </>
  );
};

export default AtmosphereDesktopPreview;
