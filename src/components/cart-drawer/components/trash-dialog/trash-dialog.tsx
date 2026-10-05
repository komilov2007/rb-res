"use client";

import { useRef } from "react";
import Button from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useCartStore } from "@/stores/cart";
import { useTranslations } from "next-intl";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { clearCartList, getCartList, removeCartItem } from "@/apis/cart";
import { useAuthStore } from "@/stores/auth";
import { normalizeCartItems } from "@/utils/cart";
import { REACT_QUERY_KEYS } from "@/constants/react-query-keys";
import { getCartLineKey } from "@/utils/cart-items";

const RemoveCartDialog = () => {
  const t = useTranslations();
  const removeLineKey = useCartStore((state) => state.removeLineKey);
  const clearCartConfirmOpen = useCartStore(
    (state) => state.clearCartConfirmOpen,
  );
  const carts = useCartStore((state) => state.carts);
  const closeRemoveModal = useCartStore((state) => state.closeRemoveModal);
  const closeClearCartModal = useCartStore((state) => state.closeClearCartModal);
  const confirmRemoveCart = useCartStore((state) => state.confirmRemoveCart);
  const setCarts = useCartStore((state) => state.setCarts);
  const customerId = useAuthStore((state) => state.auth?.customer);
  const queryClient = useQueryClient();
  const removeMutation = useMutation({
    mutationFn: removeCartItem,
  });
  const clearMutation = useMutation({
    mutationFn: async (customer: number) => {
      await clearCartList(customer);
      setCarts([]);
      return getCartList(customer);
    },
  });
  const removeAndRefetchMutation = useMutation({
    mutationFn: async ({ id, customer }: { id: number; customer: number }) => {
      await removeCartItem(id);
      return getCartList(customer);
    },
  });
  const isClearMode = clearCartConfirmOpen;
  const isOpen = removeLineKey !== null || clearCartConfirmOpen;
  const isPending =
    removeMutation.isPending ||
    clearMutation.isPending ||
    removeAndRefetchMutation.isPending;

  const inFlightRef = useRef(false);

  const handleRemove = async () => {
    if (inFlightRef.current || isPending) return;

    inFlightRef.current = true;

    try {
      if (isClearMode) {
        if (customerId) {
          const response = await clearMutation.mutateAsync(customerId);

          queryClient.setQueryData(
            [REACT_QUERY_KEYS.CART_LIST, customerId],
            response,
          );
          setCarts(normalizeCartItems(response.data));
        } else {
          setCarts([]);
        }

        closeClearCartModal();
        return;
      }

      const cartItem = carts.find(
        (item) => getCartLineKey(item) === removeLineKey,
      );

      if (cartItem?.id) {
        if (customerId) {
          const response = await removeAndRefetchMutation.mutateAsync({
            id: cartItem.id,
            customer: customerId,
          });

          queryClient.setQueryData(
            [REACT_QUERY_KEYS.CART_LIST, customerId],
            response,
          );
          setCarts(
            normalizeCartItems(response.data, useCartStore.getState().carts),
          );
          closeRemoveModal();
          return;
        }

        await removeMutation.mutateAsync(cartItem.id);
      }

      confirmRemoveCart();
    } catch {
    } finally {
      inFlightRef.current = false;
    }
  };

  const handleClose = () => {
    closeRemoveModal();
    closeClearCartModal();
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          handleClose();
        }
      }}
    >
      <DialogContent
        showCloseButton={false}
        className="w-[calc(100%-32px)] max-w-[400px] rounded-2xl border border-gray180 bg-white p-6"
      >
        <DialogHeader className="pr-10">
          <DialogTitle className="title60 text-black">
            {t("remove_order")}
          </DialogTitle>
        </DialogHeader>

        <DialogFooter className="mt-1 flex-row gap-3 bg-white">
          <Button
            type="button"
            variant="outline"
            size="dialogAction"
            onClick={handleClose}
          >
            {t("cancel")}
          </Button>

          <Button
            type="button"
            variant="destructive"
            size="dialogAction"
            onClick={handleRemove}
            disabled={isPending}
          >
            {t("delete")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RemoveCartDialog;
