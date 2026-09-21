"use client";

import { Suspense, useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { FormProvider } from "react-hook-form";

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
        className="flex min-h-0 flex-1 flex-col"
      >
        <Variant />
      </form>
    </FormProvider>
  );
};

const BookingContent = ({ variant }: BookingProps) => {
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

  return (
    <div className="flex h-dvh flex-col">
      <BookingForm variant={variant} />
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
