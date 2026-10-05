import { create } from "zustand";

import type { ProductProps } from "@/types/product";

type ProductBranchPickerStoreProps = {
  product: ProductProps | null;
  isOpen: boolean;
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
