"use client";

import { useState } from "react";
import { useCartStore } from "@/stores/cart";
import { useBoolean } from "@/hooks/useBoolean";
import type { CardProductProps } from "@/types/product";
import { useProductDetailStore } from "@/stores/product-detail";
import { addNoParameterCart, getCartList } from "@/apis/cart";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth";
import { normalizeCartItems } from "@/utils/cart";

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
  const setCartQuantity = useCartStore((state) => state.setCartQuantity);
  const openProductDetail = useProductDetailStore(
    (state) => state.openProductDetail,
  );
  const setCarts = useCartStore((state) => state.setCarts);
  const customerId = useAuthStore((state) => state.auth?.customer);
  const setLoginModal = useAuthStore((state) => state.setLoginModal);
  const queryClient = useQueryClient();
  const [displayQuantity, setDisplayQuantity] = useState<number | null>(null);
  const [isCartSyncing, setIsCartSyncing] = useState(false);
  const stockMutation = useMutation({
    mutationFn: ({
      customerId,
      productId,
      quantity,
      data,
    }: {
      customerId: number | string;
      productId: number;
      quantity: number;
      data: { branch_id?: string };
    }) => addNoParameterCart(customerId, productId, quantity, data),
  });
  const cartItem = carts.find((item) => item.product.id === product.id);
  const quantity = cartItem?.quantity ?? 0;
  const shownQuantity = displayQuantity ?? quantity;
  const branchId = product.branches?.[0];

  const refreshCartList = async () => {
    if (!customerId) return;

    const response = await queryClient.fetchQuery({
      queryKey: ["cart-list", customerId],
      queryFn: () => getCartList(customerId),
      staleTime: 0,
    });

    setCarts(normalizeCartItems(response.data, useCartStore.getState().carts));
    await queryClient.invalidateQueries({
      queryKey: ["cart-list", customerId],
    });
  };

  const syncStockQuantity = async (nextQuantity: number) => {
    if (!customerId) return nextQuantity;

    setIsCartSyncing(true);

    try {
      const response = await stockMutation.mutateAsync({
        customerId,
        productId: product.id,
        quantity: nextQuantity,
        data: {
          branch_id: branchId ? String(branchId) : undefined,
        },
      });

      await refreshCartList();

      return response.data.quantity;
    } finally {
      setIsCartSyncing(false);
      setDisplayQuantity(null);
    }
  };
  const openCounter = () => {
    counter.setTrue();
  };

  const handleAddCart = async () => {
    // Adding to the cart requires login — guests get the login modal
    // instead, checked before the parameter-product detail so the two never
    // stack. After login the home page opens the address/branch selection
    // itself (app/page.tsx) when none is saved yet.
    if (!customerId) {
      setLoginModal(true);
      return;
    }

    if (product.have_parameter) {
      openProductDetail(product, saleBadgeVariant, "default");
      return;
    }

    const syncedQuantity = await syncStockQuantity(quantity + 1);
    addCart(product);
    setCartQuantity(product.id, syncedQuantity);
    openCounter();
  };

  const handleIncrement = async () => {
    if (!customerId) {
      setLoginModal(true);
      return;
    }

    if (product.have_parameter) {
      openProductDetail(product, saleBadgeVariant, "default");
      return;
    }

    const syncedQuantity = await syncStockQuantity(quantity + 1);
    setCartQuantity(product.id, syncedQuantity);
    openCounter();
  };

  const handleDecrement = async () => {
    if (product.have_parameter && !cartItem) {
      openProductDetail(product, saleBadgeVariant, "default");
      return;
    }

    if (!customerId) {
      setCartQuantity(product.id, Math.max(quantity - 1, 0));
      openCounter();
      return;
    }

    const nextQuantity = Math.max(quantity - 1, 0);
    setDisplayQuantity(nextQuantity);
    if (nextQuantity === 0) {
      setCartQuantity(product.id, 0);
    }
    const syncedQuantity = await syncStockQuantity(nextQuantity);
    if (nextQuantity === 0) {
      return;
    }
    setCartQuantity(product.id, syncedQuantity);
    openCounter();
  };

  const handleOpenCounter = () => {
    openCounter();
  };

  const handleChangeQuantity = async (quantity: number) => {
    if (!customerId) {
      setLoginModal(true);
      return;
    }

    if (product.have_parameter) {
      openProductDetail(product, saleBadgeVariant, "default");
      return;
    }

    const syncedQuantity = await syncStockQuantity(quantity);
    setCartQuantity(product.id, syncedQuantity);
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
    handleOpenCounter,
    handleChangeQuantity,
  };
};

