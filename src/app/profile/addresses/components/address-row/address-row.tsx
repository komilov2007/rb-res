"use client";

import { IconMapPinFilled, IconPencilFilled, IconTrashFilled } from "@tabler/icons-react";
import { useTranslations } from "next-intl";

import type { AddressProps } from "@/apis/address";
import { useAddressBranch } from "@/components/branch-selection/useAddressBranch";
import {
  getBranchLabel,
  getShortAddress,
} from "@/components/branch-selection/utils";
import { useShopId } from "@/hooks/useShopId";
import type { BranchProps } from "@/types/branch";

type AddressRowProps = {
  item: AddressProps;
  // The shop's active branches — the one serving this address is shown as
  // a pill.
  branches: BranchProps[];
  onEdit: () => void;
  onDelete: () => void;
};

// One saved address with its edit/delete actions.
const AddressRow = ({ item, branches, onEdit, onDelete }: AddressRowProps) => {
  const t = useTranslations();
  const { shopid } = useShopId();
  // The backend's own pick, same as the order page will deliver from.
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
            {item.name || getShortAddress(item.address)}
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

export default AddressRow;
