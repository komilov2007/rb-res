import { create } from "zustand";

// TEMPORARY — desktop /atmosphere photo-count preview: how each column
// ("Menyu", "Galereya") looks with 1, 2, 3 or 4 photos. Delete this whole
// folder (and its usage in atmosphere.tsx) once the layouts are approved.
// 0 = every photo the column has.
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
