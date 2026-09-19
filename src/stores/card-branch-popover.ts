import { create } from "zustand";

type CardBranchPopoverStoreProps = {
  // Which product's inline "boshqa filial tanlash" popover is open — at
  // most one at a time, tracked by id (not the whole product/a boolean per
  // card) so opening one popover implicitly closes any other: every
  // card-product instance compares its own product.id against this and
  // only the match renders open, no extra "close others" call needed.
  openProductId: number | null;
  openCardBranchPopover: (productId: number) => void;
  closeCardBranchPopover: () => void;
};

export const useCardBranchPopoverStore = create<CardBranchPopoverStoreProps>()(
  (set) => ({
    openProductId: null,

    openCardBranchPopover: (productId) => {
      set({ openProductId: productId });
    },

    closeCardBranchPopover: () => {
      set({ openProductId: null });
    },
  }),
);
