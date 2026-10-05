import { create } from "zustand";

type ShopStatusStoreProps = {
  closedModalOpen: boolean;
  openClosedModal: () => void;
  closeClosedModal: () => void;
};

export const useShopStatusStore = create<ShopStatusStoreProps>((set) => ({
  closedModalOpen: false,
  openClosedModal: () => set({ closedModalOpen: true }),
  closeClosedModal: () => set({ closedModalOpen: false }),
}));
