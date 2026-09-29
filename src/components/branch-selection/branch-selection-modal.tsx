"use client";

import { useEffect, useRef, useState } from "react";

import { BranchMapPicker } from "@/components/branch-map-picker";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useGeneral } from "@/hooks/useGeneral";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useAuthStore } from "@/stores/auth";
import { useBranchSelectionStore } from "@/stores/branch-selection";
import { useCartStore } from "@/stores/cart";
import { useLocationStore } from "@/stores/location";
import { useShopStatusStore } from "@/stores/shop-status";

import { useBranchSelection } from "./useBranchSelection";
import { useNearestBranches } from "./useNearestBranches";
import { SelectionContent } from "./selection-content";

// "Manzil yoki filialni o'zgartirish" modal — mounted once in PageLayout and
// opened through the branch-selection store (header selector, home
// auto-open). Tapping a row writes the pick straight to the stores and closes
// the modal, so the header selector and product filter are already updated
// when it disappears. Closing this way (not a dismissal) keeps a pending
// checkout, which then continues.
const BranchSelectionModal = () => {
  const selection = useBranchSelection();
  const { shopid } = selection;
  const { data: general } = useGeneral();
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const selectionModal = useBranchSelectionStore(
    (state) => state.selectionModal,
  );
  const setSelectionModal = useBranchSelectionStore(
    (state) => state.setSelectionModal,
  );
  const setDelivery = useBranchSelectionStore((state) => state.setDelivery);
  const setPickup = useBranchSelectionStore((state) => state.setPickup);
  const pendingSelection = useBranchSelectionStore(
    (state) => state.pendingSelection,
  );
  const setPendingSelection = useBranchSelectionStore(
    (state) => state.setPendingSelection,
  );
  const hasAccess = useAuthStore((state) => state.hasAccess);
  const loginModal = useAuthStore((state) => state.loginModal);
  const signupModal = useAuthStore((state) => state.signupModal);
  const setPendingCheckout = useCartStore((state) => state.setPendingCheckout);
  const closedModalOpen = useShopStatusStore((state) => state.closedModalOpen);
  const locationModal = useLocationStore((state) => state.locationModal);
  const storeAddress = useLocationStore((state) => state.address);
  const openLocationMap = useLocationStore((state) => state.openLocationMap);
  // Address before the map picker opened; non-null while the picker is open.
  const mapReturnRef = useRef<string | null>(null);
  // The pickup branch picker. Rendered here rather than inside PickupTab
  // because opening it closes this modal, which would unmount a picker that
  // lived in the modal's own content.
  const [branchPickerOpen, setBranchPickerOpen] = useState(false);
  // True while the picker is standing in for this modal, so dismissing it
  // without a pick brings the modal back (same deal as the delivery map
  // above). A completed pick clears it, so the modal stays closed.
  const reopenAfterPickerRef = useRef(false);
  const { list: pickupBranches } = useNearestBranches(selection.branches);
  // Choosing requires login: a request made while logged out (home auto-open,
  // order-page redirect) waits, and shows only after login and the name step
  // are closed — never for a guest, never on top of the auth modals.
  // The closed-shop modal goes first too: the request waits until it's
  // dismissed instead of stacking on top of it.
  const isVisible =
    selectionModal &&
    hasAccess &&
    !loginModal &&
    !signupModal &&
    !closedModalOpen;

  // Only offer what the shop actually has; both when services are unknown.
  const activeServices =
    general?.data?.services
      ?.filter((service) => service.is_active)
      .map((service) => service.type) ?? [];
  const canDeliver =
    activeServices.length === 0 || activeServices.includes("DELIVERY");
  const canPickup =
    activeServices.length === 0 || activeServices.includes("PICKUP");

  // Back from the map picker: a newly picked point is a selection like any
  // row tap — it becomes the delivery choice and the modal stays closed.
  // Leaving the map without picking brings the modal back.
  useEffect(() => {
    if (locationModal || mapReturnRef.current === null) return;

    const previousAddress = mapReturnRef.current;

    mapReturnRef.current = null;

    if (shopid && storeAddress && storeAddress !== previousAddress) {
      setDelivery(shopid);
      return;
    }

    setSelectionModal(true);
  }, [locationModal, storeAddress, shopid, setDelivery, setSelectionModal]);

  // A guest's "choose address" tap opened login first (header chip). Once
  // the login and name steps are closed: logged in → open the selection;
  // login dismissed → drop the request.
  useEffect(() => {
    if (!pendingSelection || loginModal || signupModal) return;

    setPendingSelection(false);
    if (hasAccess) setSelectionModal(true);
  }, [
    pendingSelection,
    loginModal,
    signupModal,
    hasAccess,
    setPendingSelection,
    setSelectionModal,
  ]);

  const handleOpenMap = () => {
    mapReturnRef.current = storeAddress;
    openLocationMap();
    setSelectionModal(false);
  };

  const handleOpenBranchPicker = () => {
    reopenAfterPickerRef.current = true;
    setBranchPickerOpen(true);
    setSelectionModal(false);
  };

  const handleCloseBranchPicker = () => {
    setBranchPickerOpen(false);

    if (!reopenAfterPickerRef.current) return;

    reopenAfterPickerRef.current = false;
    setSelectionModal(true);
  };

  // Runs before the picker's own onClose, so clearing the flag here is what
  // keeps this modal closed after a real pick.
  const handlePickBranch = (branchId: number) => {
    if (!shopid) return;

    reopenAfterPickerRef.current = false;
    setPickup(shopid, branchId);
  };

  const handleOpenChange = (open: boolean) => {
    if (open) return;

    setSelectionModal(false);
    // Dismissed without choosing: drop a checkout that was waiting on
    // this choice, so a later pick doesn't jump to the order page.
    if (!selection.hasSelection) setPendingCheckout(false);
  };

  const content = (
    <SelectionContent
      selection={selection}
      canDeliver={canDeliver}
      canPickup={canPickup}
      onOpenMap={handleOpenMap}
      onOpenPickupMap={handleOpenBranchPicker}
      pickupBranches={pickupBranches}
      workingTime={general?.data?.working_time}
    />
  );

  // The picker is a sibling of the modal, not a child, so the modal can
  // close while it stays open.
  const branchPicker = (
    <BranchMapPicker
      open={branchPickerOpen}
      onClose={handleCloseBranchPicker}
      branches={pickupBranches}
      workingTime={general?.data?.working_time}
      desktop="drawer"
      value={selection.serviceType === "PICKUP" ? selection.branchId : null}
      onSelect={handlePickBranch}
    />
  );

  if (isDesktop) {
    return (
      <>
        <Dialog open={isVisible} onOpenChange={handleOpenChange}>
          <DialogContent className="max-w-[460px] gap-0 overflow-hidden rounded-3xl border border-gray180 bg-white p-0">
            {content}
          </DialogContent>
        </Dialog>
        {branchPicker}
      </>
    );
  }

  // Mobile: bottom drawer. Sheet is the same Radix Dialog primitive, so
  // DialogTitle inside SelectionContent still works.
  return (
    <>
      <Sheet open={isVisible} onOpenChange={handleOpenChange}>
        <SheetContent
          side="bottom"
          aria-describedby={undefined}
          className="overflow-hidden rounded-t-3xl border-gray180 p-0"
        >
          <span className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-gray180" />
          {content}
        </SheetContent>
      </Sheet>
      {branchPicker}
    </>
  );
};

export default BranchSelectionModal;
