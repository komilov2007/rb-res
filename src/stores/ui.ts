import { create } from "zustand";

type UiStoreProps = {
  isDiscountDrawerOpen: boolean;
  isMobileHeaderDrawerOpen: boolean;
  setDiscountDrawerOpen: (open: boolean) => void;
  setMobileHeaderDrawerOpen: (open: boolean) => void;
};

export const useUiStore = create<UiStoreProps>()((set) => ({
  isDiscountDrawerOpen: false,
  isMobileHeaderDrawerOpen: false,
  setDiscountDrawerOpen: (open) => {
    set({ isDiscountDrawerOpen: open });
  },
  setMobileHeaderDrawerOpen: (open) => {
    set({ isMobileHeaderDrawerOpen: open });
  },
}));
