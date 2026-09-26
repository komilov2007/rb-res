import { create } from "zustand";

// TEMPORARY — desktop "Buyurtmalarim" placement preview. Delete this whole
// folder (and its usages) once a variant is chosen.
export const ORDERS_PREVIEW_GROUPS = [
  {
    title: "Header",
    items: [
      { id: 0, label: "Hozirgi" },
      { id: 1, label: "Header ikonka + badge" },
      { id: 4, label: "Profil badge" },
      { id: 7, label: "Topbar link" },
      { id: 19, label: "Yuqori status polosa" },
    ],
  },
  {
    title: "Qo'l ostida",
    items: [
      { id: 14, label: "Pastki orol" },
      { id: 15, label: "Chet tab + panel" },
      { id: 22, label: "Hand action" },
    ],
  },
] as const;

type OrdersPreviewState = {
  variant: number;
  panelOpen: boolean;
  setVariant: (variant: number) => void;
  togglePanel: () => void;
};

export const useOrdersPreviewStore = create<OrdersPreviewState>((set) => ({
  variant: 0,
  panelOpen: true,
  setVariant: (variant) => set({ variant }),
  togglePanel: () => set((state) => ({ panelOpen: !state.panelOpen })),
}));

// Which pieces each variant shows.
export const useOrdersPreview = () => {
  const v = useOrdersPreviewStore((state) => state.variant);

  return {
    variant: v,
    showCurrent: v === 0,
    showHeaderIcon: v === 1,
    showProfileBadge: v === 4,
    showTopbarLink: v === 7,
    showTopStrip: v === 19,
    showIsland: v === 14,
    showEdgeTab: v === 15,
    showHandAction: v === 22,
  };
};
