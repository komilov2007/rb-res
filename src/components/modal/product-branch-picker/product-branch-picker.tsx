"use client";

import { useTranslations } from "next-intl";
import { BranchMapPicker } from "@/components/branch-map-picker";
import { useBranchSelection } from "@/components/branch-selection";
import { useGeneral } from "@/hooks/useGeneral";
import { useBranchSelectionStore } from "@/stores/branch-selection";
import { useProductBranchPickerStore } from "@/stores/product-branch-picker";

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
