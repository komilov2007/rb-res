"use client";

import { create } from "zustand";
import { ChevronDown, LayoutGrid } from "lucide-react";
import AtmosphereDesktop from "@/app/atmosphere/components/atmosphere-desktop/index";
import type { AtmosphereVariantProps } from "@/app/atmosphere/atmosphere";
import { Maximize2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { ATMOSPHERE_VIDEO_SRC } from "@/app/atmosphere/atmosphere";

export const ATMOSPHERE_PREVIEW_VARIANTS = [
  { id: 0, label: "Hammasi" },
  { id: 1, label: "1 ta rasm" },
  { id: 2, label: "2 ta rasm" },
  { id: 3, label: "3 ta rasm" },
  { id: 4, label: "4 ta rasm" },
] as const;

type AtmospherePreviewState = {
  variant: number;
  panelOpen: boolean;
  setVariant: (variant: number) => void;
  togglePanel: () => void;
};

export const useAtmospherePreviewStore = create<AtmospherePreviewState>(
  (set) => ({
    variant: 0,
    panelOpen: true,
    setVariant: (variant) => set({ variant }),
    togglePanel: () => set((state) => ({ panelOpen: !state.panelOpen })),
  }),
);

type AtmosphereDesktopPreviewProps = AtmosphereVariantProps & {
  onBook: () => void;
};

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
        {!panelOpen && `Rasmlar: ${variant || "hammasi"}`}
        <ChevronDown
          size={14}
          className={`transition-transform ${panelOpen ? "-rotate-90" : "rotate-90"}`}
        />
      </button>
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

const AtmosphereDesktopPreview = (props: AtmosphereDesktopPreviewProps) => {
  const variant = useAtmospherePreviewStore((state) => state.variant);

  return (
    <>
      <AtmosphereDesktop {...props} photoCount={variant || undefined} />
      <Switcher />
    </>
  );
};

export { AtmosphereDesktopPreview };

export default AtmosphereDesktopPreview;

type AtmosphereHeroProps = {
  onOpen: () => void;
};

const AtmosphereHero = ({ onOpen }: AtmosphereHeroProps) => {
  const t = useTranslations();

  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={t("atmosphere_title")}
      className="relative block h-[62dvh] min-h-[380px] w-full overflow-hidden bg-black text-left"
    >
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        className="h-full w-full object-cover"
      >
        <source src={ATMOSPHERE_VIDEO_SRC} type="video/mp4" />
      </video>

      <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/5 to-black/80" />

      <span className="absolute right-4 top-[calc(env(safe-area-inset-top)+12px)] flex h-10 w-10 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur-md">
        <Maximize2 size={18} />
      </span>

    </button>
  );
};

export { AtmosphereHero };
