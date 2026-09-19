import type { CardProductProps, ProductProps } from "@/types/product";
import { create } from "zustand";

type ProductDetailVariant = "default" | "parametrChip";
type ProductDetailDesktopVariant = "center" | "rightDrawer";

type ProductDetailStoreProps = {
  product: ProductProps | null;
  isOpen: boolean;
  saleBadgeVariant: CardProductProps["saleBadgeVariant"];
  variant: ProductDetailVariant;
  desktopVariant: ProductDetailDesktopVariant;
  openProductDetail: (
    product: ProductProps,
    saleBadgeVariant?: CardProductProps["saleBadgeVariant"],
    variant?: ProductDetailVariant,
    desktopVariant?: ProductDetailDesktopVariant,
  ) => void;
  closeProductDetail: () => void;
};

export const useProductDetailStore = create<ProductDetailStoreProps>()(
  (set) => ({
    product: null,
    isOpen: false,
    saleBadgeVariant: "orange",
    variant: "default",
    desktopVariant: "center",

    openProductDetail: (
      product,
      saleBadgeVariant = "orange",
      variant = "default",
      desktopVariant = "center",
    ) => {
      set({ product, saleBadgeVariant, variant, desktopVariant, isOpen: true });
    },

    closeProductDetail: () => {
      set({
        product: null,
        isOpen: false,
        variant: "default",
        desktopVariant: "center",
      });
    },
  }),
);



