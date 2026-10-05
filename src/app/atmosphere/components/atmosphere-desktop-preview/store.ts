import { create } from "zustand";

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
