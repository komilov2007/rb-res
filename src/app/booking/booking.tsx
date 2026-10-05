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

import BookingOne from "./components/booking-one";
import BookingTwo from "./components/booking-two";
import type { BookingVariant } from "./constants";
import { usePage } from "./usePage";

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

export default Booking;
