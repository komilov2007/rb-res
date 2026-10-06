"use client";

import { Suspense, useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { FormProvider } from "react-hook-form";
import Breadcrumb from "@/components/breadcrumb";
import Footer from "@/components/footer";
import Header from "@/components/header";
import ProductDetailMobile from "@/components/modal/product-detail";
import { ROUTER } from "@/constants/router";
import { useShopId } from "@/hooks/useShopId";
import { useAuthStore } from "@/stores/auth";
import BookingOne from "@/app/booking/components/booking-one/index";
import BookingTwo from "@/app/booking/components/booking-two/index";
import { usePage } from "./utils";
import * as yup from "yup";
import { getDateValue } from "@/utils/format-date";
import { translate } from "@/utils/translate";
import { isDayOff, isIsoDate, isPastSlot, isTime, isWithinWorkingHours, type WorkingTime } from "./utils";

export type BookingVariant = "one" | "two";

export const BOOKING_MIN_GUESTS = 1;
export const BOOKING_MAX_GUESTS = 999;

const VARIANTS = {
  one: BookingOne,
  two: BookingTwo,
} satisfies Record<BookingVariant, unknown>;

type BookingProps = {
  variant?: BookingVariant;
};

const subscribeNoop = () => () => {};

const BookingForm = ({ variant = "one" }: BookingProps) => {
  const { form, onSubmit } = usePage();
  const Variant = VARIANTS[variant];

  return (
    <FormProvider {...form}>
      <form
        noValidate
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex min-h-0 flex-1 flex-col lg:flex-auto"
      >
        <Variant />
      </form>
    </FormProvider>
  );
};

const BookingContent = ({ variant }: BookingProps) => {
  const t = useTranslations();
  const router = useRouter();
  const { shopid } = useShopId();
  const hasAccess = useAuthStore((state) => state.hasAccess);
  const setLoginModal = useAuthStore((state) => state.setLoginModal);

  const isHydrated = useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );
  const mustLogin = isHydrated && !hasAccess;

  useEffect(() => {
    if (!mustLogin) return;

    router.replace(`${ROUTER.HOME}${shopid ? `?shop_id=${shopid}` : ""}`);
    setLoginModal(true);
  }, [mustLogin, router, shopid, setLoginModal]);

  if (!isHydrated || !hasAccess) return null;

  return (
    <div className="flex h-dvh flex-col lg:h-auto lg:min-h-screen lg:bg-gray10">
      <div className="hidden lg:block">
        <Header />
      </div>
      <Breadcrumb items={[{ label: t("booking_title") }]} />
      <BookingForm variant={variant} />
      <Footer />
      <ProductDetailMobile />
    </div>
  );
};

const Booking = ({ variant }: BookingProps) => (
  <Suspense>
    <BookingContent variant={variant} />
  </Suspense>
);

export type BookingSchemaContext = { workingTime?: WorkingTime };

const PHONE_LENGTH = 9;

const isFullPhone = (value?: string) => value?.length === PHONE_LENGTH;

export const bookingSchema = yup.object({
  name: yup.string().default(""),
  phone: yup.string().default(""),
  extra_phone: yup
    .string()
    .default("")
    .test(
      "full-phone",
      () => translate("booking_errors_phone_invalid"),
      (value) => !value || isFullPhone(value),
    ),
  date: yup
    .string()
    .default("")
    .required(() => translate("booking_errors_date_required"))
    .test(
      "valid",
      () => translate("booking_errors_date_invalid"),
      (value) => !value || isIsoDate(value),
    )
    .test(
      "not-past",
      () => translate("booking_errors_date_past"),
      (value) => !value || !isIsoDate(value) || value >= getDateValue(new Date()),
    )
    .test(
      "day-off",
      () => translate("booking_errors_date_closed"),
      function (value) {
        const { workingTime } = (this.options.context ?? {}) as BookingSchemaContext;

        return !value || !isDayOff(workingTime, value);
      },
    ),
  time: yup
    .string()
    .default("")
    .required(() => translate("booking_errors_time_required"))
    .test(
      "valid",
      () => translate("booking_errors_time_invalid"),
      (value) => !value || isTime(value),
    )
    .test(
      "not-past",
      () => translate("booking_errors_time_past"),
      function (value) {
        const { date } = this.parent as { date?: string };

        return !value || !isTime(value) || !isPastSlot(date ?? "", value);
      },
    )
    .test(
      "working-hours",
      () => translate("booking_errors_time_closed"),
      function (value) {
        const { date } = this.parent as { date?: string };
        const { workingTime } = (this.options.context ?? {}) as BookingSchemaContext;

        if (!value || !isTime(value) || !date || !isIsoDate(date)) return true;
        if (isDayOff(workingTime, date)) return true;

        return isWithinWorkingHours(workingTime, date, value);
      },
    ),
  guests: yup
    .number()
    .default(BOOKING_MIN_GUESTS)
    .min(BOOKING_MIN_GUESTS)
    .max(BOOKING_MAX_GUESTS)
    .required(),
  comment: yup.string().default(""),
});

export type BookingFormValues = yup.InferType<typeof bookingSchema>;

export { Booking };

export default Booking;
