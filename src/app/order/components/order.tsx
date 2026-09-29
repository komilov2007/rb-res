"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { FormProvider } from "react-hook-form";
import { ChevronLeft } from "lucide-react";
import { useTranslations } from "next-intl";

import Button from "@/components/ui/button";
import Breadcrumb from "@/components/breadcrumb";
import Footer from "@/components/footer";
import Header from "@/components/header";
import { useBranchSelection } from "@/components/branch-selection";
import BranchSelectionModal from "@/components/branch-selection/branch-selection-modal";
import { ROUTER } from "@/constants/router";
import { useMediaQuery } from "@/hooks/useMediaQuery";
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
import PromoCode from "./promo-code";
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
    isServicesLoading,
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
    cashbackBall,
    oldPrice,
    displayTotal,
    submitError,
  } = usePage();
  const {
    orderId,
    paymentUrl,
    paymentType,
    checkStatus,
    isCheckingStatus,
    isTimedOut,
    retryWaiting,
    orderUrl,
  } = useOrderStatus();
  // The desktop shell (home's Header/Footer) is mounted only on desktop, so
  // its effects (location autofill, branch queries) never run on mobile,
  // where this page keeps its own top bar.
  const isDesktop = useMediaQuery("(min-width: 1024px)");
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
      <div className="flex min-h-screen flex-col bg-gray10">
        {isDesktop && <Header />}

        <PaymentWaiting
          paymentUrl={paymentUrl}
          paymentType={paymentType}
          onCheck={checkStatus}
          isChecking={isCheckingStatus}
          isTimedOut={isTimedOut}
          onRetry={retryWaiting}
          orderUrl={orderUrl}
        />

        {isDesktop && (
          <>
            <Footer />
            {/* Same reason as below: the Header's branch chip needs it. */}
            <BranchSelectionModal />
          </>
        )}
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray10">
      {isDesktop && <Header />}
      <Breadcrumb items={[{ label: t("order_page_title") }]} />

      {/* Mobile-only app bar — desktop has the header + breadcrumb. */}
      <div className="fixed inset-x-0 top-0 z-10 rounded-b-xl border-b border-gray180 bg-white lg:hidden">
        <div className="mx-auto flex w-full max-w-xl items-center gap-2 px-4 py-4">
          <Button
            type="button"
            variant="plain"
            size="none"
            onClick={() => router.back()}
            className="text-black"
          >
            <ChevronLeft size={22} />
          </Button>
          <h1 className="text-base font-medium text-black">
            {t("order_page_title")}
          </h1>
        </div>
      </div>

      <FormProvider {...form}>
        {/* Mobile: one column (the panel wrappers are display: contents).
            Desktop: two full-bleed white panels with a thin gray gap — form
            sections left (divided by lines instead of separate cards),
            summary + submit right. Each panel pads its outer side by
            max(20px, 50% - 620px) so its content lines up with the header's
            max-w-7xl container. */}
        <form
          onSubmit={onSubmit}
          className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-3 pt-[calc(60px+env(safe-area-inset-top))] pb-[calc(72px+env(safe-area-inset-bottom))] lg:max-w-none lg:flex-row lg:gap-2 lg:py-2"
        >
          <div className="contents lg:flex lg:min-w-0 lg:flex-1 lg:flex-col lg:rounded-r-[30px] lg:bg-white lg:py-2 lg:pl-[max(20px,calc(50%-620px))] lg:pr-6 lg:[&_section]:rounded-none lg:[&_section]:border-b lg:[&_section]:border-gray180 lg:[&_section]:px-0 lg:[&_section]:py-7 lg:[&_section:last-of-type]:border-b-0">
            {/* 1. Order type: service type, address/branch, time, comment */}
            <DeliveryType
              services={availableServices}
              isServicesLoading={isServicesLoading}
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
            <PaymentMethod showPromoCode={!isDesktop} />
          </div>

          <div className="contents lg:block lg:w-[calc(max(20px,50%-620px)+420px)] lg:shrink-0 lg:rounded-l-[30px] lg:bg-white lg:pl-6 lg:pr-[max(20px,calc(50%-620px))] lg:[&_section]:rounded-none lg:[&_section]:px-0">
            <div className="contents lg:flex lg:flex-col lg:gap-5 lg:py-5">
              <YourOrder
                cartCount={cartCount}
                cartTotal={cartTotal}
                deliveryPrice={deliveryPrice}
                promoTotal={promoTotal}
                cashbackBall={cashbackBall}
                oldPrice={oldPrice}
                displayTotal={displayTotal}
              />

              {isDesktop && <PromoCode />}

              {submitError && (
                <span className="px-1 text-xs text-red">{submitError}</span>
              )}

              <PlaceOrder
                displayTotal={displayTotal}
                isSubmitting={isSubmitting}
              />
            </div>
          </div>
        </form>
      </FormProvider>

      {isDesktop && (
        <>
          <Footer />
          {/* Opened by the desktop Header's branch chip — PageLayout mounts
              it on the other pages. */}
          <BranchSelectionModal />
        </>
      )}

      <UnavailableModal
        open={isUnavailableModalOpen}
        unavailableItemIds={unavailableItemIds}
        onClose={closeUnavailableModal}
      />
    </div>
  );
};

export default Order;
