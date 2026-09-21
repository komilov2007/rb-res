"use client";

import { useTranslations } from "next-intl";

import type { AddressProps } from "@/apis/address";
import { getShortAddress } from "@/components/branch-selection/utils";
import Button from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

type DeleteAddressDialogProps = {
  // The address awaiting confirmation; null = closed.
  address: AddressProps | null;
  isDeleting: boolean;
  onCancel: () => void;
  onConfirm: (address: AddressProps) => void;
};

const DeleteAddressDialog = ({
  address,
  isDeleting,
  onCancel,
  onConfirm,
}: DeleteAddressDialogProps) => {
  const t = useTranslations();

  return (
    <Dialog
      open={Boolean(address)}
      onOpenChange={(open) => !open && onCancel()}
    >
      <DialogContent
        className="max-w-[340px] rounded-3xl bg-white p-5"
        showCloseButton={false}
      >
        <DialogTitle className="text-center text-xl font-bold text-black">
          {t("profile_page_addresses_delete_title")}
        </DialogTitle>
        <DialogDescription className="text-center text-sm font-normal text-gray220">
          {address ? getShortAddress(address.address) : ""}
        </DialogDescription>
        <div className="mt-2 grid grid-cols-2 gap-3">
          <Button
            type="button"
            variant="secondary"
            size="lg"
            onClick={onCancel}
            className="rounded-2xl"
          >
            {t("common_cancel")}
          </Button>
          <Button
            type="button"
            variant="plain"
            size="lg"
            disabled={isDeleting}
            onClick={() => address && onConfirm(address)}
            className="rounded-2xl bg-red/10 text-red"
          >
            {t("common_delete")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteAddressDialog;
