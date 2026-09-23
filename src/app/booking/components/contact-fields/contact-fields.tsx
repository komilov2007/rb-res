"use client";

import { useState } from "react";
import { Plus, UserRound, X } from "lucide-react";
import { IconPhoneFilled, IconUserFilled } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { Controller, useFormContext, useWatch } from "react-hook-form";

import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import PhoneInput from "@/components/ui/phone-input";
import { formatPhone } from "@/utils/format-number";

import type { BookingFormValues } from "../../schema";
import SectionTitle from "../section-title";

const inputWrapper = (hasError: boolean) =>
  `!h-12 !rounded-xl ${hasError ? "!border-red" : ""}`;

// Name + phone come from the user's profile and can't be edited here;
// the extra phone is optional and hidden until asked for.
const ContactFields = () => {
  const t = useTranslations();
  const {
    control,
    setValue,
    formState: { errors },
  } = useFormContext<BookingFormValues>();
  // Shown straight from the form values, so what's displayed is exactly
  // what gets submitted.
  const [name, phone] = useWatch({ control, name: ["name", "phone"] });
  const [showExtraPhone, setShowExtraPhone] = useState(false);

  const hideExtraPhone = () => {
    setValue("extra_phone", "", { shouldValidate: true });
    setShowExtraPhone(false);
  };

  return (
    <section className="flex flex-col gap-3 rounded-xl bg-white p-4">
      <SectionTitle
        Icon={UserRound}
        title={t("booking_section_contact")}
        hint={t("booking_section_contact_hint")}
      />

      {/* Read-only, same style profile/edit uses for its phone — changing
          either belongs to the profile, not to a single booking. */}
      <Input
        IconStart={IconUserFilled}
        disabled
        readOnly
        value={name}
        aria-label={t("booking_your_name")}
        placeholder={t("booking_your_name")}
        className="font-normal text-[#3D3D3D]"
        wrapperClassName="!h-12 !rounded-xl bg-gray10"
      />

      <Input
        IconStart={IconPhoneFilled}
        disabled
        readOnly
        value={phone ? `+998 ${formatPhone(phone)}` : ""}
        aria-label={t("phone_number")}
        placeholder={t("phone_number")}
        className="font-normal text-[#3D3D3D]"
        wrapperClassName="!h-12 !rounded-xl bg-gray10"
      />

      {showExtraPhone ? (
        <div>
          <div className="mb-1.5 flex items-center justify-between px-1">
            <span className="text-xs font-normal text-gray220">
              {t("booking_extra_phone")} · {t("booking_optional")}
            </span>
            <Button
              type="button"
              variant="clear"
              size="clear"
              onClick={hideExtraPhone}
              aria-label={t("booking_extra_phone")}
            >
              <X size={14} strokeWidth={2.4} />
            </Button>
          </div>
          <Controller
            control={control}
            name="extra_phone"
            render={({ field }) => (
              <PhoneInput
                autoFocus
                value={field.value}
                onChange={field.onChange}
                wrapperClassName={inputWrapper(Boolean(errors.extra_phone))}
              />
            )}
          />
          {errors.extra_phone && (
            <span className="mt-1 block px-1 text-xs text-red">
              {errors.extra_phone.message}
            </span>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowExtraPhone(true)}
          className="flex w-fit items-center gap-1.5 px-1 text-sm font-normal text-primary"
        >
          <Plus size={16} strokeWidth={2.4} />
          {t("booking_add_extra_phone")}
        </button>
      )}
    </section>
  );
};

export default ContactFields;
