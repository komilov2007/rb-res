import { useTranslations } from "next-intl";
import { toast } from "sonner";

import type { BranchProps } from "@/types/branch";
import type { ProductProps } from "@/types/product";
import { useShopId } from "@/hooks/useShopId";
import { useBranchSelectionStore } from "@/stores/branch-selection";
import { useCardBranchPopoverStore } from "@/stores/card-branch-popover";
import { showProductUnavailable } from "@/utils/branch-availability";

// The "not at this branch — pick another" popover of an unavailable card.
export const useCardBranchPopover = (product: ProductProps) => {
  const t = useTranslations();
  const { shopid } = useShopId();
  const setPickup = useBranchSelectionStore((state) => state.setPickup);
  // Only one product's popover open at a time, by id — opening this card's
  // implicitly closes whichever other card's was open (its own comparison
  // below just stops matching), no explicit "close the others" call needed.
  const openPopoverProductId = useCardBranchPopoverStore(
    (state) => state.openProductId,
  );
  const openCardBranchPopover = useCardBranchPopoverStore(
    (state) => state.openCardBranchPopover,
  );
  const closeCardBranchPopover = useCardBranchPopoverStore(
    (state) => state.closeCardBranchPopover,
  );
  const isBranchPopoverOpen = openPopoverProductId === product.id;

  // A product with no branches at all can't be fixed by switching branch —
  // that's a dead end, so it stays a plain toast. Otherwise open the inline
  // popover, overlaid right on this card, offering the actual fix.
  const handleUnavailableTap = () => {
    if (!product.branches?.length) {
      showProductUnavailable();
      return;
    }

    openCardBranchPopover(product.id);
  };

  const handleSelectBranch = (branch: BranchProps) => {
    if (!shopid) return;

    setPickup(shopid, branch.id);
    closeCardBranchPopover();
    // The header chip and every other unavailable card read this same
    // store, so they already update the instant setPickup runs — this
    // toast is purely a confirmation, not what drives that update.
    toast.success(t("product_branch_switched", { name: branch.name }), {
      duration: 2500,
    });
  };

  return {
    isBranchPopoverOpen,
    handleUnavailableTap,
    handleSelectBranch,
    closeCardBranchPopover,
  };
};
