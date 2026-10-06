"use client";

import { useMemo, useEffect, useRef, useState } from "react";
import { useDeviceLocation } from "@/hooks/useDeviceLocation";
import { useLocationStore } from "@/stores/location";
import type { BranchProps } from "@/types/branch";
import { getDistanceKm } from "@/utils/distance";
import { BranchMapPicker } from "@/components/branch-map-picker";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useGeneral } from "@/hooks/useGeneral";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useAuthStore } from "@/stores/auth";
import { useBranchSelectionStore } from "@/stores/branch-selection";
import { useCartStore } from "@/stores/cart";
import { useShopStatusStore } from "@/stores/shop-status";
import { useBranchSelection } from "./useBranchSelection";
import { SelectionContent } from "./selection-content";
import { getBranchLabel, getShortAddress } from "@/utils/address";

export const useNearestBranches = (branches: BranchProps[]) => {
  const latitude = useLocationStore((state) => state.latitude);
  const longitude = useLocationStore((state) => state.longitude);
  const hasAddressCoords = latitude !== null && longitude !== null;
  const deviceCoords = useDeviceLocation(!hasAddressCoords);
  const origin =
    latitude !== null && longitude !== null
      ? { latitude, longitude }
      : deviceCoords;

  const sorted = useMemo(
    () =>
      branches
        .map((branch) => ({
          branch,
          km: origin ? getDistanceKm(origin, branch) : null,
        }))
        .sort((a, b) => (a.km ?? 0) - (b.km ?? 0)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [branches, origin?.latitude, origin?.longitude],
  );

  const list = useMemo(() => sorted.map((item) => item.branch), [sorted]);

  return { sorted, list };
};

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
  const mapReturnRef = useRef<string | null>(null);
  const [branchPickerOpen, setBranchPickerOpen] = useState(false);
  const reopenAfterPickerRef = useRef(false);
  const { list: pickupBranches } = useNearestBranches(selection.branches);
  const isVisible =
    selectionModal &&
    hasAccess &&
    !loginModal &&
    !signupModal &&
    !closedModalOpen;

  const activeServices =
    general?.data?.services
      ?.filter((service) => service.is_active)
      .map((service) => service.type) ?? [];
  const canDeliver =
    activeServices.length === 0 || activeServices.includes("DELIVERY");
  const canPickup =
    activeServices.length === 0 || activeServices.includes("PICKUP");

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

  const handlePickBranch = (branchId: number) => {
    if (!shopid) return;

    reopenAfterPickerRef.current = false;
    setPickup(shopid, branchId);
  };

  const handleOpenChange = (open: boolean) => {
    if (open) return;

    setSelectionModal(false);
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

export const findClosestBranch = (
  branches: BranchProps[],
  coordinates: { latitude: number; longitude: number },
) =>
  branches.reduce<{ branch: BranchProps; km: number } | null>(
    (closest, branch) => {
      const km = getDistanceKm(coordinates, branch);
      return !closest || km < closest.km ? { branch, km } : closest;
    },
    null,
  )?.branch ?? null;

export { BranchSelectionModal };

export { getBranchLabel, getShortAddress };

export default BranchSelectionModal;
