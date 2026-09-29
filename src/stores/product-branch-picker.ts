import { create } from "zustand";

import type { ProductProps } from "@/types/product";

type ProductBranchPickerStoreProps = {
  product: ProductProps | null;
  isOpen: boolean;
  // Opened when a product unavailable at the current pickup/delivery branch
  // is tapped (card-product, product-detail) — lets the user switch to a
  // branch that actually carries it, instead of just a dead-end toast.
  openProductBranchPicker: (product: ProductProps) => void;
  closeProductBranchPicker: () => void;
};

export const useProductBranchPickerStore =
  create<ProductBranchPickerStoreProps>()((set) => ({
    product: null,
    isOpen: false,

    openProductBranchPicker: (product) => {
      set({ product, isOpen: true });
    },

    closeProductBranchPicker: () => {
      set({ product: null, isOpen: false });
    },
  }));
