"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { FormProvider } from "react-hook-form";
import { ChevronLeft } from "lucide-react";
import { useTranslations } from "next-intl";

import Button from "@/components/ui/button";
import { useBranchSelection } from "@/app/[page]/components/branch-selection";
import { ROUTER } from "@/constants/router";
import { useBranchSelectionStore } from "@/stores/branch-selection";
import { useCartStore } from "@/stores/cart";

import { usePage } from "../usePage";
import { useOrderStatus } from "../useOrderStatus";
import PaymentWaiting from "./payment-waiting";
import UnavailableModal from "./unavailable-modal";
import DeliveryType from "./delivery-type";
import Address from "./address";
import ShippingTime from "./shipping-time";
import BonusPoint from "./bonus-point";
import PaymentMethod from "./payment-method";
import YourOrder from "./your-order";
import PlaceOrder from "./place-order";

const subscribeNoop = () => () => {};

const Order = () => {
  const router = useRouter();
  const t = useTranslations();
  const {
    form,
    branches,
    isBranchesLoading,
    isBranchesError,
    workingTime,
    availableServices,
    hasShippingTime,
    cashbackEnabled,
    onSubmit,
    isSubmitting,
    unavailableItemIds,
    isUnavailableModalOpen,
    closeUnavailableModal,
    cartCount,
    cartTotal,
    deliveryPrice,
    promoTotal,
    unavailableTotal,
    cashbackBall,
    oldPrice,
    displayTotal,
    submitError,
  } = usePage();
  const {
    orderId,
    paymentUrl,
    paymentType,
  } = useOrderStatus();
  const { shopid, hasSelection } = useBranchSelection();
  const setSelectionModal = useBranchSelectionStore(
    (state) => state.setSelectionModal,
  );
  const setPendingCheckout = useCartStore((state) => state.setPendingCheckout);
  // During hydration zustand serves the stores' initial (empty) state, not
  // the persisted selection — only decide once hydration is done.
  const isHydrated = useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );
  // Payment callbacks (?orderId=...) belong to an already created order and
  // are never blocked.
  const mustSelect = isHydrated && !orderId && !hasSelection;

  // Entering checkout without a delivery address or pickup branch (e.g. by
  // URL): go back home with the selection modal open; the cart's pending
  // checkout brings the user back here once a choice is made.
  useEffect(() => {
    if (!mustSelect) return;

    setPendingCheckout(true);
    setSelectionModal(true);
    router.replace(`${ROUTER.HOME}${shopid ? `?shop_id=${shopid}` : ""}`);
  }, [mustSelect, router, setPendingCheckout, setSelectionModal, shopid]);

  if (orderId) {
    return (
      <PaymentWaiting
        paymentUrl={paymentUrl}
        paymentType={paymentType}
      />
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray10">
      <div className="fixed inset-x-0 top-0 z-10 rounded-b-2xl border-b border-gray180 bg-white">
        <div className="mx-auto flex w-full max-w-xl items-center gap-3 px-4 py-4">
          <Button
            type="button"
            variant="plain"
            size="none"
            onClick={() => router.back()}
            className="text-black"
          >
            <ChevronLeft size={22} />
          </Button>
          <h1 className="text-base font-extrabold text-black">
            {t("order_page_title")}
          </h1>
        </div>
      </div>

      <FormProvider {...form}>
        <form
          onSubmit={onSubmit}
          className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-1.5 pt-[calc(60px+env(safe-area-inset-top))] pb-[calc(72px+env(safe-area-inset-bottom))]"
        >
          {/* 1. Order type: service type, address/branch, time, comment */}
          <DeliveryType
            services={availableServices}
            branches={branches}
            isBranchesLoading={isBranchesLoading}
            isBranchesError={isBranchesError}
            workingTime={workingTime}
          />

          <Address />

          {hasShippingTime && <ShippingTime />}

          {/* 2. Bonus / cashback */}
          {cashbackEnabled && <BonusPoint />}

          {/* 3. Payment type (includes the promo code) */}
          <PaymentMethod />

          <YourOrder
            cartCount={cartCount}
            cartTotal={cartTotal}
            deliveryPrice={deliveryPrice}
            promoTotal={promoTotal}
            unavailableTotal={unavailableTotal}
            cashbackBall={cashbackBall}
            oldPrice={oldPrice}
            displayTotal={displayTotal}
          />

          {submitError && (
            <span className="px-1 text-xs text-red">{submitError}</span>
          )}

          <PlaceOrder
            displayTotal={displayTotal}
            isSubmitting={isSubmitting}
          />
        </form>
      </FormProvider>

      <UnavailableModal
        open={isUnavailableModalOpen}
        unavailableItemIds={unavailableItemIds}
        onClose={closeUnavailableModal}
      />
    </div>
  );
};

export default Order;
