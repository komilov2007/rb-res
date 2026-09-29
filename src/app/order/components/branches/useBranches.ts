"use client";

import { useFormContext } from "react-hook-form";

import { useBoolean } from "@/hooks/useBoolean";
import { useShopId } from "@/hooks/useShopId";
import { useBranchSelectionStore } from "@/stores/branch-selection";
import { useCartStore } from "@/stores/cart";
import { useLocationStore } from "@/stores/location";
import type { BranchProps } from "@/types/branch";
import type { CartItemProps } from "@/types/cart";
import type { OrderFormValues } from "@/types/order";
import { getDistanceKm } from "@/utils/distance";

export type BranchOptionProps = {
  branch: BranchProps;
  // Straight-line distance for display/sorting only — null when neither a
  // saved address nor a device position is known.
  km: number | null;
  // Cart product names this branch doesn't carry. Empty = everything in the
  // cart is available here.
  missingNames: string[];
  isAvailable: boolean;
};

// A cart line's product carries the branch ids that stock it
// (ProductProps.branches — the same field card-product's
// unavailable-branch-list and the product branch picker already filter on).
// An EMPTY list is treated as "unknown", not "nowhere": normalizeCartItem
// (src/utils/cart.ts) falls back to `[]` when the cart-list response omits
// `branches` for a line, and blocking every branch off a missing field would
// leave the user unable to order at all. createOrder still returns
// unavailable_products as the authoritative check in that case.
const isMissingAt = (item: CartItemProps, branchId: number) => {
  const branches = item.product.branches;

  return Array.isArray(branches) && branches.length > 0
    ? !branches.includes(branchId)
    : false;
};

type UseBranchesProps = {
  branches?: BranchProps[];
  value: number | null;
};

export const useBranches = ({ branches, value }: UseBranchesProps) => {
  const { setValue } = useFormContext<OrderFormValues>();
  const { shopid } = useShopId();
  const setPickup = useBranchSelectionStore((state) => state.setPickup);
  const carts = useCartStore((state) => state.carts);
  const latitude = useLocationStore((state) => state.latitude);
  const longitude = useLocationStore((state) => state.longitude);
  const picker = useBoolean();
  const infoSheet = useBoolean();

  // Deactivated lines aren't part of the order (usePage's buildItems drops
  // them too), so they must not disable a branch either. Guest/local items
  // have no is_active flag at all — those count as active.
  const orderedItems = carts.filter((item) => item.is_active !== false);
  const origin =
    latitude !== null && longitude !== null ? { latitude, longitude } : null;

  const options: BranchOptionProps[] = (branches ?? [])
    .filter((branch) => branch.is_active)
    .map((branch) => {
      const missingNames = orderedItems
        .filter((item) => isMissingAt(item, branch.id))
        .map((item) => item.product.name);

      return {
        branch,
        km: origin ? getDistanceKm(origin, branch) : null,
        missingNames,
        isAvailable: missingNames.length === 0,
      };
    })
    // Branches that can actually take the whole order first, nearest first
    // within each group (API order when no origin is known).
    .sort((a, b) => {
      if (a.isAvailable !== b.isAvailable) return a.isAvailable ? -1 : 1;

      return (a.km ?? 0) - (b.km ?? 0);
    });

  const selectedBranch =
    branches?.find((branch) => branch.id === value) ?? null;
  const availableCount = options.filter((option) => option.isAvailable).length;

  // Writing to the branch-selection store as well as the form keeps the one
  // selection the whole app shares (header chip, product availability,
  // cart) in step — usePage's own sync effect then mirrors it straight back
  // into this form field.
  const handleSelect = (branchId: number) => {
    setValue("branch", branchId, { shouldValidate: true });

    if (shopid) setPickup(shopid, branchId);

    picker.setFalse();
  };

  return {
    options,
    selectedBranch,
    availableCount,
    picker,
    infoSheet,
    handleSelect,
  };
};
