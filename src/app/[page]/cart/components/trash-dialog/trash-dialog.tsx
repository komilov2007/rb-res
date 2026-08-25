"use client";

import Button from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useCartStore } from "@/store/cart";
import { useTranslations } from "next-intl";

const RemoveCartDialog = () => {
  const t = useTranslations();
  const removeProductId = useCartStore((state) => state.removeProductId);
  const closeRemoveModal = useCartStore((state) => state.closeRemoveModal);
  const confirmRemoveCart = useCartStore((state) => state.confirmRemoveCart);

  return (
    <Dialog
      open={removeProductId !== null}
      onOpenChange={(open) => {
        if (!open) {
          closeRemoveModal();
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
            onClick={closeRemoveModal}
          >
            {t("cancel")}
          </Button>

          <Button
            type="button"
            variant="destructive"
            size="dialogAction"
            onClick={confirmRemoveCart}
          >
            {t("delete")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RemoveCartDialog;
