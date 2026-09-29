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

// Saved address details shown under the address, in display order.
// `label` is a translation key.
const DETAIL_FIELDS = [
  { name: "entrance", label: "order_page_address_entrance" },
  { name: "floor", label: "floor" },
  { name: "room", label: "room" },
] as const;

// rb-restaurant doesn't create a new address here (unlike rb-shop's own
// "address", which owns a nested form + createAddress mutation, per
// AGENTS.md Section 22.7) — it only displays the already-selected address.
// useOrderDelivery fills the address id, entrance/floor/room and the
// courier comment from the saved address (they are asked once, when the
// address is added), so the details are a read-only line here — edited
// through the address picker. Only the courier comment stays editable,
// behind a toggle, for a one-off note on this order.
const Address = () => {
  const t = useTranslations();
  const {
    control,
    formState: { errors },
  } = useFormContext<OrderFormValues>();
  const deliveryType = useWatch({ control, name: "delivery_type" });
  // The form's own address id, not useLocationStore's own `address` text —
  // that's a locally persisted (localStorage) value that can outlive what
  // the my-addresses API actually returns. Same cached addresses query the
  // delivery autofill uses, so looking the id up here can never disagree
  // with the id the order will actually submit.
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
  // A saved comment opens it straight away, so it's never hidden.
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
          {/* Street + house only — the district/city/postcode/country tail
              is noise here; the full address stays in the address picker. */}
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
              // text-base (16px) avoids iOS Safari's auto-zoom-on-focus.
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
