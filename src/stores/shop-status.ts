import { create } from "zustand";

// Just the modal's open flag — the shop's actual is_open/message live in
// TanStack Query (useGeneral), not duplicated here. A plain client-state
// flag shared between two unrelated mount points (GeneralProvider, which
// opens it on load, and useCartFooter, which opens it again on a blocked
// "Buyurtma berish" tap) — exactly the case Zustand is for.
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
