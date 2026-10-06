"use client";

import { Minus, Plus, Users } from "lucide-react";
import { useTranslations } from "next-intl";
import { Controller, useFormContext } from "react-hook-form";
import { getDigits } from "@/utils/format-number";
import { BOOKING_MAX_GUESTS, BOOKING_MIN_GUESTS } from "@/app/booking/booking";
import type { BookingFormValues } from "@/app/booking/booking";
import { TwoField } from "../two-footer";
import { ChevronLeft, Images } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations as useTranslationsTwoHero } from "next-intl";
import { ROUTER } from "@/constants/router";
import { useShopId } from "@/hooks/useShopId";
import { galleryImages } from "@/constants/atmosphere";

const TwoGuests = () => {
  const t = useTranslations();
  const { control } = useFormContext<BookingFormValues>();

  return (
    <Controller
      control={control}
      name="guests"
      render={({ field }) => (
        <TwoField
          Icon={Users}
          label={t("booking_guests")}
          end={
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                disabled={field.value <= BOOKING_MIN_GUESTS}
                onClick={() =>
                  field.onChange(Math.max(BOOKING_MIN_GUESTS, field.value - 1))
                }
                aria-label={t("booking_guests_decrease")}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-gray10 text-black disabled:opacity-40"
              >
                <Minus size={14} strokeWidth={2.4} />
              </button>
              <button
                type="button"
                disabled={field.value >= BOOKING_MAX_GUESTS}
                onClick={() =>
                  field.onChange(Math.min(BOOKING_MAX_GUESTS, field.value + 1))
                }
                aria-label={t("booking_guests_increase")}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white disabled:opacity-40"
              >
                <Plus size={14} strokeWidth={2.4} />
              </button>
            </div>
          }
        >
          <input
            inputMode="numeric"
            aria-label={t("booking_guests")}
            value={field.value || ""}
            onChange={(event) =>
              field.onChange(Number(getDigits(event.target.value, 3)))
            }
            onBlur={() => {
              if (field.value < BOOKING_MIN_GUESTS) field.onChange(BOOKING_MIN_GUESTS);
              field.onBlur();
            }}
            onFocus={(event) => event.target.select()}
            className="w-full bg-transparent text-base font-normal leading-5 text-black outline-none"
          />
        </TwoField>
      )}
    />
  );
};

export default TwoGuests;

const TwoHero = () => {
  const t = useTranslationsTwoHero();
  const router = useRouter();
  const { shopid } = useShopId();

  const openAtmosphere = () =>
    router.push(`${ROUTER.ATMOSPHERE}${shopid ? `?shop_id=${shopid}` : ""}`);

  return (
    <div className="relative h-64 overflow-hidden rounded-b-2xl bg-gray10 lg:h-80 lg:rounded-2xl">
      <button
        type="button"
        onClick={openAtmosphere}
        aria-label={t("atmosphere_title")}
        className="block h-full w-full"
      >
        <img
          src={galleryImages[1].src}
          alt=""
          className="h-full w-full object-cover"
        />
      </button>

      <button
        type="button"
        onClick={() => router.back()}
        aria-label={t("common_back")}
        className="absolute left-4 top-[calc(env(safe-area-inset-top)+12px)] flex h-10 w-10 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-md lg:hidden"
      >
        <ChevronLeft size={22} />
      </button>
      <button
        type="button"
        onClick={openAtmosphere}
        aria-label={t("atmosphere_title")}
        className="absolute right-4 top-[calc(env(safe-area-inset-top)+12px)] flex h-10 items-center gap-1.5 rounded-full bg-black/30 pl-3 pr-4 text-sm font-medium text-white backdrop-blur-md"
      >
        <Images size={16} />
        {t("atmosphere_title")}
      </button>
    </div>
  );
};

export { TwoHero };
