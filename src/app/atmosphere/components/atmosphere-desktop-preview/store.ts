import { create } from "zustand";

// TEMPORARY — desktop /atmosphere layout preview. Delete this whole folder
// (and its usage in atmosphere.tsx) once a variant is chosen.
export const ATMOSPHERE_PREVIEW_VARIANTS = [
  { id: 0, label: "Hozirgi (bento)" },
  { id: 1, label: "Sticky matn + lenta" },
  { id: 2, label: "Kino hero + filmstrip" },
  { id: 4, label: "Jurnal (zigzag)" },
  { id: 5, label: "Boblar (Dishoom) — tavsiya" },
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
