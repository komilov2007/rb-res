"use client";

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

const RemoveCartDialog = () => {
  const t = useTranslations();
  const removeProductId = useCartStore((state) => state.removeProductId);
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
    mutationFn: clearCartList,
  });
  const isClearMode = clearCartConfirmOpen;
  const isOpen = removeProductId !== null || clearCartConfirmOpen;

  const handleRemove = async () => {
    if (isClearMode) {
      if (customerId) {
        await clearMutation.mutateAsync(customerId);
        setCarts([]);

        const response = await getCartList(customerId);
        const nextCarts = normalizeCartItems(response.data);

        queryClient.setQueryData(["cart-list", customerId], response);
        setCarts(nextCarts);
      } else {
        setCarts([]);
      }

      closeClearCartModal();
      return;
    }

    const cartItem = carts.find((item) => item.product.id === removeProductId);

    if (cartItem?.id) {
      await removeMutation.mutateAsync(cartItem.id);
      if (customerId) {
        const response = await getCartList(customerId);
        queryClient.setQueryData(["cart-list", customerId], response);
        setCarts(
          normalizeCartItems(response.data, useCartStore.getState().carts),
        );
        closeRemoveModal();
        return;
      }
    }

    confirmRemoveCart();
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
            disabled={removeMutation.isPending || clearMutation.isPending}
          >
            {t("delete")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RemoveCartDialog;

