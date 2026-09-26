"use client";

import { useState } from "react";
import { useCartStore } from "@/stores/cart";
import { useBoolean } from "@/hooks/useBoolean";
import type { CardProductProps } from "@/types/product";
import { useProductDetailStore } from "@/stores/product-detail";
import { addNoParameterCart, updateCartItem } from "@/apis/cart";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth";
import { getCartBranchId } from "@/utils/cart";
import { useRefreshCart } from "@/hooks/useRefreshCart";
import { useBranchSelection } from "@/components/branch-selection";

export const useCardProduct = ({
  product,
  saleBadgeVariant = "red",
}: CardProductProps) => {
  const isDiscount = Boolean(product.discount_price || product.sale_amount);
  const price = product.discount_price ?? product.price;
  const showOldPrice = isDiscount && product.discount_price;
  const counter = useBoolean();
  const carts = useCartStore((state) => state.carts);
  const addCart = useCartStore((state) => state.addCart);
  const setProductQuantity = useCartStore((state) => state.setProductQuantity);
  const openProductDetail = useProductDetailStore(
    (state) => state.openProductDetail,
  );
  const customerId = useAuthStore((state) => state.auth?.customer);
  const setLoginModal = useAuthStore((state) => state.setLoginModal);
  const [displayQuantity, setDisplayQuantity] = useState<number | null>(null);
  const [isCartSyncing, setIsCartSyncing] = useState(false);
  // Argument types come straight from the API functions, so the payloads
  // can't drift from src/apis/cart.ts.
  const stockMutation = useMutation({
    mutationFn: (args: Parameters<typeof addNoParameterCart>) =>
      addNoParameterCart(...args),
  });
  const parameterMutation = useMutation({
    mutationFn: (args: Parameters<typeof updateCartItem>) =>
      updateCartItem(...args),
  });
  const openCartModal = useCartStore((state) => state.openCartModal);
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const { branchId: selectedBranchId } = useBranchSelection();
  // The card manages the product's plain line (cards only handle products
  // without parameters) — never a parameter line of the same product.
  const cartItem = carts.find(
    (item) =>
      item.product.id === product.id &&
      !item.parameter &&
      !item.ad_parameter?.length,
  );
  // A parameter product has no plain line — its card shows the total of all
  // its parameter lines instead, so it gets a counter like any other card.
  const parameterLines = product.have_parameter
    ? carts.filter((item) => item.product.id === product.id)
    : [];
  const quantity = product.have_parameter
    ? parameterLines.reduce((sum, item) => sum + item.quantity, 0)
    : (cartItem?.quantity ?? 0);
  const shownQuantity = displayQuantity ?? quantity;
  const branchId = getCartBranchId(product.branches, selectedBranchId);
  const branchData = { branch_id: branchId ? String(branchId) : undefined };

  const refreshCart = useRefreshCart();

  // The server's quantity, or null when the write failed — the global
  // request interceptor already toasts the backend's message, and the cart
  // is re-read so any optimistic local change is undone.
  const syncStockQuantity = async (
    nextQuantity: number,
  ): Promise<number | null> => {
    if (!customerId) return nextQuantity;

    setIsCartSyncing(true);

    try {
      const response = await stockMutation.mutateAsync([
        customerId,
        product.id,
        nextQuantity,
        branchData,
      ]);

      await refreshCart();

      return response.data.quantity;
    } catch {
      await refreshCart().catch(() => {});

      return null;
    } finally {
      setIsCartSyncing(false);
      setDisplayQuantity(null);
    }
  };
  const openCounter = () => {
    counter.setTrue();
  };

  // Changes a parameter product's quantity from the card. Only possible
  // when it has exactly one line; with several the card can't know which
  // one is meant, so the cart opens instead (where each line has its own
  // counter). Same updateCartItem call the cart drawer's counter makes.
  const changeParameterQuantity = async (nextQuantity: number) => {
    const line = parameterLines.length === 1 ? parameterLines[0] : null;

    if (!customerId || !line || typeof line.id !== "number") {
      openCartModal(isDesktop ? "desktop" : "mobile");
      return;
    }

    setDisplayQuantity(nextQuantity);
    setIsCartSyncing(true);

    try {
      await parameterMutation.mutateAsync([line.id, nextQuantity, branchData]);
      await refreshCart();
    } catch {
      // The interceptor already toasted it; re-read the real cart.
      await refreshCart().catch(() => {});
    } finally {
      setIsCartSyncing(false);
      setDisplayQuantity(null);
    }
  };

  // Shared by the "add" button and the counter's "+": adding to the cart
  // requires login — guests get the login modal instead, checked before the
  // parameter-product detail so the two never stack. After login the home
  // page opens the address/branch selection itself (app/page.tsx) when none
  // is saved yet. Only the first add also puts the product into the store.
  const addOne = async (isFirstAdd: boolean) => {
    if (!customerId) {
      setLoginModal(true);
      return;
    }

    if (product.have_parameter) {
      openProductDetail(product, saleBadgeVariant, "default");
      return;
    }

    const syncedQuantity = await syncStockQuantity(quantity + 1);

    if (syncedQuantity === null) return;

    if (isFirstAdd) addCart(product);
    setProductQuantity(product.id, syncedQuantity);
    openCounter();
  };

  const handleAddCart = () => addOne(true);

  const handleIncrement = () => addOne(false);

  const handleDecrement = async () => {
    if (product.have_parameter) {
      if (quantity === 0) {
        openProductDetail(product, saleBadgeVariant, "default");
        return;
      }

      await changeParameterQuantity(Math.max(quantity - 1, 0));
      return;
    }

    if (!customerId) {
      setProductQuantity(product.id, Math.max(quantity - 1, 0));
      openCounter();
      return;
    }

    const nextQuantity = Math.max(quantity - 1, 0);
    setDisplayQuantity(nextQuantity);
    if (nextQuantity === 0) {
      setProductQuantity(product.id, 0);
    }
    const syncedQuantity = await syncStockQuantity(nextQuantity);
    // Removed (already done locally) or failed (the refreshed cart holds the
    // real quantity).
    if (nextQuantity === 0 || syncedQuantity === null) {
      return;
    }
    setProductQuantity(product.id, syncedQuantity);
    openCounter();
  };

  const handleChangeQuantity = async (quantity: number) => {
    if (!customerId) {
      setLoginModal(true);
      return;
    }

    if (product.have_parameter) {
      await changeParameterQuantity(quantity);
      return;
    }

    const syncedQuantity = await syncStockQuantity(quantity);

    if (syncedQuantity === null) return;

    setProductQuantity(product.id, syncedQuantity);
    openCounter();
  };

  return {
    price,
    counter,
    quantity: shownQuantity,
    cartItem,
    isDiscount,
    showOldPrice,
    isStockLoading: stockMutation.isPending || isCartSyncing,
    handleAddCart,
    handleIncrement,
    handleDecrement,
    handleOpenCounter: openCounter,
    handleChangeQuantity,
  };
};
