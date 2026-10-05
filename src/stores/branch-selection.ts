import { create } from "zustand";
import { persist } from "zustand/middleware";

export type BranchSelectionServiceType = "DELIVERY" | "PICKUP";

type BranchSelectionStoreProps = {
  shopId: string | null;
  serviceType: BranchSelectionServiceType | null;
  branchId: number | null;
  selectionModal: boolean;
  pendingSelection: boolean;
  setPickup: (shopId: string, branchId: number) => void;
  setDelivery: (shopId: string) => void;
  clearSelection: () => void;
  setSelectionModal: (selectionModal: boolean) => void;
  setPendingSelection: (pendingSelection: boolean) => void;
};

export const useBranchSelectionStore = create<BranchSelectionStoreProps>()(
  persist(
    (set) => ({
      shopId: null,
      serviceType: null,
      branchId: null,
      selectionModal: false,
      pendingSelection: false,

      setPickup: (shopId, branchId) => {
        set({ shopId, serviceType: "PICKUP", branchId });
      },

      setDelivery: (shopId) => {
        set({ shopId, serviceType: "DELIVERY", branchId: null });
      },

      clearSelection: () => {
        set({ shopId: null, serviceType: null, branchId: null });
      },

      setSelectionModal: (selectionModal) => {
        set({ selectionModal });
      },

      setPendingSelection: (pendingSelection) => {
        set({ pendingSelection });
      },
    }),
    {
      name: "branch-selection",
      partialize: (state) => ({
        shopId: state.shopId,
        serviceType: state.serviceType,
        branchId: state.branchId,
      }),
    },
  ),
);
