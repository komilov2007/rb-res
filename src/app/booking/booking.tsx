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

// One form for every variant: usePage owns useForm + submit, the variant
// only renders the UI (fields read/write through useFormContext).
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

  // Same access guard as chat.tsx: AuthProvider fills the auth store in its
  // own (parent) effect, so wait out the first commit before trusting it.
  const isHydrated = useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );
  const mustLogin = isHydrated && !hasAccess;

  // Direct navigation to /booking while logged out (the floating-action
  // button already guards its own click): back home, login modal there.
  useEffect(() => {
    if (!mustLogin) return;

    router.replace(`${ROUTER.HOME}${shopid ? `?shop_id=${shopid}` : ""}`);
    setLoginModal(true);
  }, [mustLogin, router, shopid, setLoginModal]);

  if (!isHydrated || !hasAccess) return null;

  // Mobile: full-screen app shell (h-dvh, the variant scrolls inside).
  // Desktop: the window scrolls between the site Header and Footer, like
  // home (no PageLayout — its Hand button would cover the mobile submit bar).
  return (
    <div className="flex h-dvh flex-col lg:h-auto lg:min-h-screen lg:bg-gray10">
      <div className="hidden lg:block">
        <Header />
      </div>
      <Breadcrumb items={[{ label: t("booking_title") }]} />
      <BookingForm variant={variant} />
      <Footer />
      {/* Header search results open the product detail modal. */}
      <ProductDetailMobile />
    </div>
  );
};

// useSearchParams (shop_id) needs a Suspense boundary.
const Booking = ({ variant }: BookingProps) => (
  <Suspense>
    <BookingContent variant={variant} />
  </Suspense>
);

export default Booking;
