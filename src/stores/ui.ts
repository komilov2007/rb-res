import { create } from "zustand";

type UiStoreProps = {
  isDiscountDrawerOpen: boolean;
  isMobileHeaderDrawerOpen: boolean;
  // Desktop chat modal (ChatModal, mounted once in the app provider).
  isChatModalOpen: boolean;
  setDiscountDrawerOpen: (open: boolean) => void;
  setMobileHeaderDrawerOpen: (open: boolean) => void;
  setChatModalOpen: (open: boolean) => void;
};

export const useUiStore = create<UiStoreProps>()((set) => ({
  isDiscountDrawerOpen: false,
  isMobileHeaderDrawerOpen: false,
  isChatModalOpen: false,
  setDiscountDrawerOpen: (open) => {
    set({ isDiscountDrawerOpen: open });
  },
  setMobileHeaderDrawerOpen: (open) => {
    set({ isMobileHeaderDrawerOpen: open });
  },
  setChatModalOpen: (open) => {
    set({ isChatModalOpen: open });
  },
}));
