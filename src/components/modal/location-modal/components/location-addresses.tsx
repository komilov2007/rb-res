import { Plus, SlidersHorizontal } from "lucide-react";
import { useTranslations } from "next-intl";

import type { AddressProps } from "@/apis/address";
import Button from "@/components/ui/button";
import XButton from "@/components/ui/x-button";

const getShortAddress = (address: string) => {
  const parts = address.split(",").map((part) => part.trim()).filter(Boolean);

  return {
    title: parts.slice(0, 2).join(", ") || address,
    subtitle: parts.slice(2).join(", "),
  };
};

type LocationAddressesProps = {
  addresses?: AddressProps[];
  activeAddressId: number | null;
  onClose: () => void;
  onAdd: () => void;
  onEdit: (address: AddressProps) => void;
  onSelect: (address: AddressProps) => void;
};

const LocationAddresses = ({
  addresses,
  activeAddressId,
  onClose,
  onAdd,
  onEdit,
  onSelect,
}: LocationAddressesProps) => {
  const t = useTranslations();
  return (
    <div className="flex max-h-[70dvh] w-full flex-col bg-white px-5 pb-[max(20px,env(safe-area-inset-bottom))] pt-4">
      <div className="shrink-0 border-b border-gray180 pb-3 flex items-center justify-between gap-4">
        <h2 className="text-[22px] font-bold leading-7 text-black">
          {t("location.my_addresses")}
        </h2>
        <XButton size="lg" onClick={onClose} className="bg-gray10" />
      </div>

      <div className="scroll-hidden max-h-[52dvh] min-h-0 overflow-y-auto">
        {!addresses && (
          <div className="py-8 text-sm font-normal text-gray220">
            {t("location.addresses_loading")}
          </div>
        )}

        {addresses?.map((item) => {
          const address = getShortAddress(item.address);
          const checked = activeAddressId === item.id;

          return (
            <div
              key={item.id}
              className="flex items-center gap-3 border-b border-gray180 py-3 last:border-b-0"
            >
              <button
                type="button"
                onClick={() => onSelect(item)}
                className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border ${
                  checked
                    ? "border-green-500 bg-green-500"
                    : "border-gray220 bg-white"
                }`}
                aria-label={t("location.select_address_aria")}
              >
                {checked && <span className="h-2.5 w-2.5 rounded-full bg-white" />}
              </button>

              <button
                type="button"
                onClick={() => onSelect(item)}
                className="min-w-0 flex-1 text-left"
              >
                <span className="line-clamp-1 text-sm font-medium leading-5 text-black">
                  {address.title}
                </span>
                {address.subtitle && (
                  <span className="mt-0.5 block line-clamp-1 text-xs font-medium leading-4 text-gray220">
                    {address.subtitle}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => onEdit(item)}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gray10 text-gray220"
                aria-label={t("location.edit_address")}
              >
                <SlidersHorizontal size={18} strokeWidth={2.2} />
              </button>
            </div>
          );
        })}
      </div>

      <div className={`shrink-0 bg-white pt-3 ${addresses?.length ? "border-t border-gray180" : ""}`}>
        <Button
          type="button"
          variant="ghost"
          size="lg"
          onClick={onAdd}
          className="h-11 justify-start gap-2 rounded-xl px-0 text-primary hover:bg-transparent"
        >
          <Plus size={19} strokeWidth={2.5} />
          {t("location.create_new")}
        </Button>
      </div>
    </div>
  );
};

export default LocationAddresses;







