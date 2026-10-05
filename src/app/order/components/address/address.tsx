"use client";

import { useTranslations } from "next-intl";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import { ChevronRight, Plus } from "lucide-react";
import { IconMapPinFilled } from "@tabler/icons-react";

import { isServiceDelivery } from "@/constants/delivery-type";
import { useAuthStore } from "@/stores/auth";
import { useLocationStore } from "@/stores/location";
import { getShortAddress } from "@/utils/address";
import type { OrderFormValues } from "@/types/order";
import { useAddresses } from "@/hooks/useAddresses";
import { useBoolean } from "@/hooks/useBoolean";

import {
  ADDRESS_NOT_DELIVERABLE_MESSAGE,
  useAddressDeliverable,
} from "../../useAddressDeliverable";

const DETAIL_FIELDS = [
  { name: "entrance", label: "order_page_address_entrance" },
  { name: "floor", label: "floor" },
  { name: "room", label: "room" },
] as const;

const Address = () => {
  const t = useTranslations();
  const {
    control,
    formState: { errors },
  } = useFormContext<OrderFormValues>();
  const deliveryType = useWatch({ control, name: "delivery_type" });
  const addressId = useWatch({ control, name: "address" });
  const [entrance, floor, room, comment] = useWatch({
    control,
    name: ["entrance", "floor", "room", "comment"],
  });
  const customerId = useAuthStore((state) => state.auth?.customer);
  const setLocationModal = useLocationStore((state) => state.setLocationModal);
  const commentOpen = useBoolean();

  const { data: addressesData } = useAddresses(customerId);
  const selectedAddress =
    addressesData?.data.find((item) => item.id === addressId) ?? null;
  const { isAllowed } = useAddressDeliverable(deliveryType, selectedAddress);

  if (!isServiceDelivery(deliveryType)) return null;

  const detailValues = { entrance, floor, room };
  const details = DETAIL_FIELDS.filter(
    ({ name }) => detailValues[name] !== null && detailValues[name] !== undefined,
  ).map(({ name, label }) => `${t(label)}: ${detailValues[name]}`);
  const showComment = commentOpen.value || Boolean(comment);

  const addressError = errors.address?.message
    ? errors.address.message
    : !isAllowed
      ? t(ADDRESS_NOT_DELIVERABLE_MESSAGE)
      : null;

  return (
    <section className="rounded-xl bg-white p-3">
      <h2 className="text-sm font-medium text-black">
        {t("location_delivery_address_title")}
      </h2>

      <button
        type="button"
        onClick={() => setLocationModal(true)}
        className="group mt-2 flex w-full items-center gap-3 py-2 text-left"
      >
        <IconMapPinFilled
          size={20}
          className={`shrink-0 ${addressError ? "text-red" : "text-gray220"}`}
        />
        <span className="min-w-0 flex-1">
          <span
            title={selectedAddress?.address}
            className={`block truncate text-sm font-normal ${
              selectedAddress?.address ? "text-black" : "text-gray220"
            }`}
          >
            {selectedAddress?.address
              ? getShortAddress(selectedAddress.address)
              : t("order_page_address_not_selected")}
          </span>
          {details.length > 0 && (
            <span className="mt-0.5 block truncate text-xs font-normal text-gray220/70">
              {details.join(" · ")}
            </span>
          )}
        </span>
        <ChevronRight
          size={18}
          className="shrink-0 text-gray220 transition-transform group-hover:translate-x-0.5"
        />
      </button>
      {addressError && (
        <span className="block text-xs text-red">{addressError}</span>
      )}

      {showComment ? (
        <Controller
          control={control}
          name="comment"
          render={({ field }) => (
            <textarea
              rows={2}
              maxLength={500}
              autoFocus={commentOpen.value && !comment}
              placeholder={t("order_page_comment_title")}
              value={field.value ?? ""}
              onChange={(event) => field.onChange(event.target.value || null)}
              className="mt-2 block min-h-11 w-full resize-none rounded-xl border border-transparent bg-[#F6F7F9] px-3 py-2.5 text-base leading-6 text-black outline-none transition-colors duration-200 placeholder:text-gray220 hover:border-gray180 focus:border-orange-200 focus:bg-white lg:text-sm"
            />
          )}
        />
      ) : (
        <button
          type="button"
          onClick={commentOpen.setTrue}
          className="mt-1 flex items-center gap-1.5 text-xs font-medium"
        >
          <span className="flex items-center gap-1.5 text-primary">
            <Plus size={14} strokeWidth={2.5} />
            {t("order_page_comment_title")}
          </span>
        </button>
      )}
    </section>
  );
};

export default Address;
