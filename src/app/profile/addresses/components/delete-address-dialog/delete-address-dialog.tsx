"use client";

import { useTranslations } from "next-intl";
import type { AddressProps } from "@/types/address";
import { getShortAddress } from "@/components/branch-selection/branch-selection-modal";
import Button from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { IconMapPinFilled, IconPencilFilled, IconTrashFilled } from "@tabler/icons-react";
import { useTranslations as useTranslationsAddressRow } from "next-intl";
import type { AddressProps as AddressPropsAddressRow } from "@/types/address";
import { useAddressBranch } from "@/components/branch-selection/useBranchSelection";
import { getBranchLabel, getShortAddress as getShortAddressAddressRow } from "@/components/branch-selection/branch-selection-modal";
import { useShopId } from "@/hooks/useShopId";
import type { BranchProps } from "@/types/branch";

type DeleteAddressDialogProps = {
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
        <DialogTitle className="text-center text-xl font-medium text-black">
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

type AddressRowProps = {
  item: AddressPropsAddressRow;
  branches: BranchProps[];
  onEdit: () => void;
  onDelete: () => void;
};

const AddressRow = ({ item, branches, onEdit, onDelete }: AddressRowProps) => {
  const t = useTranslationsAddressRow();
  const { shopid } = useShopId();
  const branch = useAddressBranch(shopid, branches, item);

  return (
    <div
      data-address-row={item.id}
      className="flex items-center gap-3 rounded-2xl border border-gray180 bg-white p-3"
    >
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gray10 text-gray220">
        <IconMapPinFilled size={17} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-2">
          <span className="info-label line-clamp-1 min-w-0">
            {item.name || getShortAddressAddressRow(item.address)}
          </span>
          {branch && (
            <span className="shrink-0 whitespace-nowrap rounded-full bg-gray10 px-2 py-0.5 text-[11px] text-gray220">
              {getBranchLabel(branch.name)}
            </span>
          )}
        </div>
        <p className="info-value line-clamp-2">
          {item.address}
        </p>
      </div>
      <button
        type="button"
        onClick={onEdit}
        aria-label={t("profile_page_addresses_edit_aria")}
        className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gray10 text-gray220"
      >
        <IconPencilFilled size={15} />
      </button>
      <button
        type="button"
        onClick={onDelete}
        aria-label={t("profile_page_addresses_delete_aria")}
        className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-red/10 text-red"
      >
        <IconTrashFilled size={15} />
      </button>
    </div>
  );
};

export { AddressRow };
