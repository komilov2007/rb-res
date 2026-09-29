import { create } from "zustand";
import { persist } from "zustand/middleware";

export type BranchSelectionServiceType = "DELIVERY" | "PICKUP";

type BranchSelectionStoreProps = {
  // The selection belongs to one shop — ignored when a different shop_id is
  // opened.
  shopId: string | null;
  serviceType: BranchSelectionServiceType | null;
  // Pickup branch. For delivery the branch is resolved from the address
  // (nearest branch query), not stored.
  branchId: number | null;
  selectionModal: boolean;
  // A guest tapped "choose address": login opens first, and the selection
  // modal follows once login (and the name step) is done.
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
