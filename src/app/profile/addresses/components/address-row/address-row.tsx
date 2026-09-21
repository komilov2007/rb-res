"use client";

import { Edit3, MapPin, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";

import type { AddressProps } from "@/apis/address";
import {
  getBranchLabel,
  getShortAddress,
} from "@/components/branch-selection/utils";
import type { BranchProps } from "@/types/branch";

type AddressRowProps = {
  item: AddressProps;
  // Closest branch to this address, shown as a pill.
  branch: BranchProps | null;
  onEdit: () => void;
  onDelete: () => void;
};

// One saved address with its edit/delete actions.
const AddressRow = ({ item, branch, onEdit, onDelete }: AddressRowProps) => {
  const t = useTranslations();

  return (
    <div
      data-address-row={item.id}
      className="flex items-center gap-3 rounded-2xl border border-gray180 bg-white p-3"
    >
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gray10 text-gray220">
        <MapPin size={17} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-2">
          <span className="line-clamp-1 min-w-0 text-sm font-medium text-black">
            {item.name || getShortAddress(item.address)}
          </span>
          {branch && (
            <span className="shrink-0 whitespace-nowrap rounded-full bg-gray10 px-2 py-0.5 text-[11px] text-gray220">
              {getBranchLabel(branch.name)}
            </span>
          )}
        </div>
        <p className="mt-0.5 line-clamp-2 text-xs text-gray220">
          {item.address}
        </p>
      </div>
      <button
        type="button"
        onClick={onEdit}
        aria-label={t("profile_page_addresses_edit_aria")}
        className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gray10 text-gray220"
      >
        <Edit3 size={15} />
      </button>
      <button
        type="button"
        onClick={onDelete}
        aria-label={t("profile_page_addresses_delete_aria")}
        className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-red/10 text-red"
      >
        <Trash2 size={15} />
      </button>
    </div>
  );
};

export default AddressRow;
