"use client";

import { useTranslations } from "next-intl";
import { BranchMapPicker } from "@/components/branch-map-picker";
import { useBranchSelection } from "@/app/[page]/components/branch-selection";
import { useGeneral } from "@/hooks/useGeneral";
import { useBranchSelectionStore } from "@/stores/branch-selection";
import { useProductBranchPickerStore } from "@/stores/product-branch-picker";

// Mounted once, globally (PageLayout), same as ProductDetailMobile/
// BranchSelectionModal — triggered from anywhere a product renders as
// unavailable at the current branch (card-product, product-detail) via
// useProductBranchPickerStore, instead of each caller owning its own copy.
// Reuses BranchMapPicker (src/components/branch-map-picker) — the same
// map+card picker the header's "Xaritadan tanlash" and the order page's own
// branch field already use — just pre-filtered to branches that actually
// carry this one product, and its pick becomes the pickup branch exactly
// like those other entry points (this app has no other way to pin an
// explicit branch; delivery resolves to the nearest one instead).
const ProductBranchPicker = () => {
  const t = useTranslations();
  const product = useProductBranchPickerStore((state) => state.product);
  const isOpen = useProductBranchPickerStore((state) => state.isOpen);
  const closeProductBranchPicker = useProductBranchPickerStore(
    (state) => state.closeProductBranchPicker,
  );
  const { shopid, branches, branchId } = useBranchSelection();
  const { data: general } = useGeneral();
  const setPickup = useBranchSelectionStore((state) => state.setPickup);

  const availableBranches = product
    ? branches.filter((branch) => product.branches?.includes(branch.id))
    : [];

  const handleSelect = (nextBranchId: number) => {
    if (!shopid) return;

    setPickup(shopid, nextBranchId);
    closeProductBranchPicker();
  };

  if (!product) return null;

  return (
    <BranchMapPicker
      open={isOpen}
      onClose={closeProductBranchPicker}
      branches={availableBranches}
      workingTime={general?.data?.working_time}
      value={branchId}
      onSelect={handleSelect}
      title={t("product_choose_other_branch")}
    />
  );
};

export default ProductBranchPicker;
