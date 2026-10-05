import { create } from "zustand";
import { persist } from "zustand/middleware";

import { DEFAULT_PRIMARY_COLOR, type PrimaryColorId } from "@/constants/theme";

type ThemeStoreProps = {
  primaryColor: PrimaryColorId;
  panelOpen: boolean;
  setPrimaryColor: (primaryColor: PrimaryColorId) => void;
  togglePanel: () => void;
};

export const useThemeStore = create<ThemeStoreProps>()(
  persist(
    (set) => ({
      primaryColor: DEFAULT_PRIMARY_COLOR,
      panelOpen: true,
      setPrimaryColor: (primaryColor) => {
        set({ primaryColor });
      },
      togglePanel: () => {
        set((state) => ({ panelOpen: !state.panelOpen }));
      },
    }),
    {
      name: "theme",
      partialize: (state) => ({ primaryColor: state.primaryColor }),
    },
  ),
);
