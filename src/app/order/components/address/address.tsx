"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import { ChevronRight, MapPin, MessageSquareText } from "lucide-react";

import Input from "@/components/ui/input";
import { isServiceDelivery } from "@/constants/delivery-type";
import { useAuthStore } from "@/stores/auth";
import { useLocationStore } from "@/stores/location";
import { getDigits } from "@/utils/format-number";
import type { OrderFormValues } from "@/types/order";
import { useAddresses } from "@/hooks/useAddresses";

import CommentDrawer from "../comment-drawer";
import {
  ADDRESS_NOT_DELIVERABLE_MESSAGE,
  useAddressDeliverable,
} from "../../useAddressDeliverable";

// rb-restaurant doesn't create a new address here (unlike rb-shop's own
// "address", which owns a nested form + createAddress mutation, per
// AGENTS.md Section 22.7) — it only displays the already-selected address.
// usePage autofills address/room/floor/entrance/comment from the customer's
// real saved-addresses list; this binds the editable fields onto the main
// order form.
const Address = () => {
  const t = useTranslations();
  const {
    control,
    setValue,
    formState: { errors },
  } = useFormContext<OrderFormValues>();
  const deliveryType = useWatch({ control, name: "delivery_type" });
  const comment = useWatch({ control, name: "comment" });
  // The form's own address id, not useLocationStore's own `address` text —
  // that's a locally persisted (localStorage) value that can outlive what
  // the my-addresses API actually returns (a guest map pick from an
  // earlier session, a different account, ...), which is exactly what was
  // showing an address here while the my-addresses API had none at all and
  // the validation error below correctly said so. Same
  // ["user-addresses", customerId] query/key usePage.ts's own address
  // autofill effect already runs, so this is a shared cache read, not an
  // extra request — and looking the id up here (rather than trusting a
  // separately-derived "active address") means this can never disagree
  // with what the id itself is: the id the order will actually submit.
  const addressId = useWatch({ control, name: "address" });
  const customerId = useAuthStore((state) => state.auth?.customer);
  const setLocationModal = useLocationStore((state) => state.setLocationModal);
  const [commentOpen, setCommentOpen] = useState(false);

  const { data: addressesData } = useAddresses(customerId);
  const selectedAddress =
    addressesData?.data.find((item) => item.id === addressId) ?? null;
  const { isAllowed } = useAddressDeliverable(deliveryType, selectedAddress);

  if (!isServiceDelivery(deliveryType)) return null;

  return (
    <section className="rounded-2xl bg-white p-4">
      <button
        type="button"
        onClick={() => setLocationModal(true)}
        className="flex w-full items-center gap-3 text-left"
      >
        <MapPin size={18} className="shrink-0 text-gray220" />
        <p className="min-w-0 flex-1 truncate text-sm font-medium text-black">
          {selectedAddress?.address || t("order_page_address_not_selected")}
        </p>
        <ChevronRight size={18} className="shrink-0 text-gray220" />
      </button>
      {errors.address?.message ? (
        <span className="mt-1 block px-1 text-xs text-red">
          {errors.address.message}
        </span>
      ) : (
        !isAllowed && (
          <span className="mt-1 block px-1 text-xs text-red">
            {t(ADDRESS_NOT_DELIVERABLE_MESSAGE)}
          </span>
        )
      )}

      <div className="mt-3 grid grid-cols-3 gap-3">
        <label>
          <Controller
            control={control}
            name="entrance"
            render={({ field }) => (
              <Input
                placeholder={t("order_page_address_entrance")}
                inputMode="numeric"
                wrapperClassName="!h-11 !rounded-xl !px-3"
                value={field.value ?? ""}
                onChange={(event) => {
                  const digits = getDigits(event.target.value);
                  field.onChange(digits ? Number(digits) : null);
                }}
              />
            )}
          />
        </label>

        <label>
          <Controller
            control={control}
            name="floor"
            render={({ field }) => (
              <Input
                placeholder={t("floor")}
                inputMode="numeric"
                wrapperClassName="!h-11 !rounded-xl !px-3"
                value={field.value ?? ""}
                onChange={(event) => {
                  const digits = getDigits(event.target.value);
                  field.onChange(digits ? Number(digits) : null);
                }}
              />
            )}
          />
        </label>

        <label>
          <Controller
            control={control}
            name="room"
            render={({ field }) => (
              <Input
                placeholder={t("room")}
                inputMode="numeric"
                wrapperClassName="!h-11 !rounded-xl !px-3"
                value={field.value ?? ""}
                onChange={(event) => {
                  const digits = getDigits(event.target.value);
                  field.onChange(digits ? Number(digits) : null);
                }}
              />
            )}
          />
        </label>
      </div>

      <button
        type="button"
        onClick={() => setCommentOpen(true)}
        className="mt-3 flex w-full items-center gap-3 py-2 text-left"
      >
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray10 text-gray220">
          <MessageSquareText size={14} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-normal text-black">
            {t("order_page_comment_title")}
          </span>
          {comment && (
            <span className="block truncate text-xs font-medium text-gray220">
              {comment}
            </span>
          )}
        </span>
        <ChevronRight size={18} className="shrink-0 text-gray220" />
      </button>

      <CommentDrawer
        key={String(commentOpen)}
        open={commentOpen}
        value={comment}
        onClose={() => setCommentOpen(false)}
        onSave={(value) => setValue("comment", value)}
      />
    </section>
  );
};

export default Address;
