"use client";

import { useRef } from "react";
import { useCartStore } from "@/store/cart";
import { useBoolean } from "@/hooks/useBoolean";
import type { CardProductProps } from "@/types/product";

export const useCardProduct = ({
  product,
  variant = "default",
}: CardProductProps) => {
  const isDiscount = variant === "discount";
  const price = product.discount_price ?? product.price;
  const showOldPrice = isDiscount && product.discount_price;
  const counter = useBoolean();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const carts = useCartStore((state) => state.carts);
  const addCart = useCartStore((state) => state.addCart);
  const incrementCart = useCartStore((state) => state.incrementCart);
  const decrementCart = useCartStore((state) => state.decrementCart);
  const cartItem = carts.find((item) => item.product.id === product.id);
  const quantity = cartItem?.quantity ?? 0;
  const openCounter = () => {
    counter.setTrue();
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      counter.setFalse();
    }, 2000);
  };

  const handleAddCart = () => {
    addCart(product);
    counter.setFalse();
    setTimeout(() => {
      openCounter();
    }, 30);
  };

  const handleIncrement = () => {
    incrementCart(product.id);
    openCounter();
  };

  const handleDecrement = () => {
    decrementCart(product.id);
    openCounter();
  };

  const handleOpenCounter = () => {
    openCounter();
  };

  return {
    price,
    counter,
    quantity,
    cartItem,
    isDiscount,
    showOldPrice,
    handleAddCart,
    handleIncrement,
    handleDecrement,
    handleOpenCounter,
  };
};
