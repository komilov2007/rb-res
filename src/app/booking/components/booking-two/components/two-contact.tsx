"use client";

import { useState } from "react";
import { Phone, PhoneCall, Plus, User, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Controller, useFormContext, useWatch } from "react-hook-form";

import PhoneInput from "@/components/ui/phone-input";
import { formatPhone } from "@/utils/format-number";

import type { BookingFormValues } from "../../../schema";
import TwoField from "./two-field";

// Name + phone from the profile (read-only), plus the optional extra
// phone which stays a dashed "add" button until asked for.
const TwoContact = () => {
  const t = useTranslations();
  const {
    control,
    setValue,
    formState: { errors },
  } = useFormContext<BookingFormValues>();
  const [name, phone] = useWatch({ control, name: ["name", "phone"] });
  const [showExtraPhone, setShowExtraPhone] = useState(false);

  const hideExtraPhone = () => {
    setValue("extra_phone", "", { shouldValidate: true });
    setShowExtraPhone(false);
  };

  return (
    <div className="flex flex-col gap-2">
      <TwoField Icon={User} label={t("booking_your_name")}>
        <span className="block truncate text-[15px] font-normal leading-5 text-black">
          {name || "—"}
        </span>
      </TwoField>

      <TwoField Icon={Phone} label={t("phone_number")}>
        <span className="block truncate text-[15px] font-normal leading-5 text-black">
          {phone ? `+998 ${formatPhone(phone)}` : "—"}
        </span>
      </TwoField>

      {showExtraPhone ? (
        <TwoField
          Icon={PhoneCall}
          label={`${t("booking_extra_phone")} · ${t("booking_optional")}`}
          error={errors.extra_phone?.message}
          end={
            <button
              type="button"
              onClick={hideExtraPhone}
              aria-label={t("booking_extra_phone")}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray10 text-gray220"
            >
              <X size={14} strokeWidth={2.4} />
            </button>
          }
        >
          <Controller
            control={control}
            name="extra_phone"
            render={({ field }) => (
              <PhoneInput
                autoFocus
                value={field.value}
                onChange={field.onChange}
                wrapperClassName="!h-6 !gap-2 !rounded-none !border-0 !bg-transparent !px-0 hover:!border-0 focus-within:!bg-transparent"
              />
            )}
          />
        </TwoField>
      ) : (
        <button
          type="button"
          onClick={() => setShowExtraPhone(true)}
          className="flex h-9 w-fit items-center gap-1.5 px-1 text-sm font-normal text-primary"
        >
          <Plus size={16} strokeWidth={2.4} />
          {t("booking_add_extra_phone")}
        </button>
      )}
    </div>
  );
};

export default TwoContact;
