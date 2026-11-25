"use client";

import { useEffect, useState } from "react";
import { IconMapPinFilled } from "@tabler/icons-react";
import { useTranslations } from "next-intl";

import Button from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { useBranchSelection } from "@/components/branch-selection";
import { useDeviceLocation } from "@/hooks/useDeviceLocation";
import { useAuthStore } from "@/stores/auth";
import { useBranchSelectionStore } from "@/stores/branch-selection";
import { useLocationStore } from "@/stores/location";
import { useShopStatusStore } from "@/stores/shop-status";
import { getDistanceKm } from "@/utils/distance";

// Old webapp parity: ask once per session when the device is >1 km away
// from the saved delivery address.
const SESSION_KEY = "rb-address-distance-prompt";
const MAX_DISTANCE_KM = 1;

const wasPrompted = () => {
  try {
    return window.sessionStorage.getItem(SESSION_KEY) === "1";
  } catch {
    return false;
  }
};

const markPrompted = () => {
  try {
    window.sessionStorage.setItem(SESSION_KEY, "1");
  } catch {
    // sessionStorage unavailable; the in-memory flag still applies.
  }
};

const AddressDistanceModal = () => {
  const t = useTranslations();
  const [promptedBefore] = useState(
    () => typeof window !== "undefined" && wasPrompted(),
  );
  const [checkedAddress, setCheckedAddress] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const { serviceType } = useBranchSelection();
  const hasAccess = useAuthStore((state) => state.hasAccess);
  const loginModal = useAuthStore((state) => state.loginModal);
  const signupModal = useAuthStore((state) => state.signupModal);
  const selectionModal = useBranchSelectionStore(
    (state) => state.selectionModal,
  );
  const closedModalOpen = useShopStatusStore((state) => state.closedModalOpen);
  const address = useLocationStore((state) => state.address);
  const latitude = useLocationStore((state) => state.latitude);
  const longitude = useLocationStore((state) => state.longitude);
  const locationModal = useLocationStore((state) => state.locationModal);
  const setLocationModal = useLocationStore((state) => state.setLocationModal);

  const isEligible =
    hasAccess &&
    serviceType === "DELIVERY" &&
    Boolean(address) &&
    latitude !== null &&
    longitude !== null;
  const deviceCoords = useDeviceLocation(isEligible);
  const isBlocked =
    loginModal || signupModal || selectionModal || closedModalOpen || locationModal;
  const canCheck = isEligible && !isBlocked && deviceCoords !== null;

  // Only the first address checked this mount is compared, so later address
  // changes never re-trigger the prompt.
  if (canCheck && checkedAddress === null) setCheckedAddress(address);

  const isFar =
    canCheck &&
    checkedAddress === address &&
    getDistanceKm(deviceCoords, {
      latitude: latitude as number,
      longitude: longitude as number,
    }) > MAX_DISTANCE_KM;
  const open = isFar && !promptedBefore && !dismissed;

  useEffect(() => {
    if (open) markPrompted();
  }, [open]);

  const handleChangeAddress = () => {
    setDismissed(true);
    setLocationModal(true);
  };

  return (
    <Sheet
      open={open}
      onOpenChange={(value) => {
        if (!value) setDismissed(true);
      }}
    >
      <SheetContent
        side="bottom"
        desktopModal
        showCloseButton={false}
        aria-describedby={undefined}
        className="items-center gap-0 rounded-t-3xl border-gray180 px-5 pb-[max(20px,var(--safe-bottom))] pt-3 text-center"
      >
        <span className="mx-auto h-1 w-10 shrink-0 rounded-full bg-gray180 lg:hidden" />

        <span className="mt-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary10 text-primary">
          <IconMapPinFilled size={26} />
        </span>

        <SheetTitle className="mt-3 text-lg font-medium text-black">
          {t("address_distance_title")}
        </SheetTitle>
        <p className="mt-1 text-sm font-normal text-gray220">{address}</p>

        <div className="mt-5 flex w-full flex-col gap-2">
          <Button
            type="button"
            variant="primary-solid"
            size="lg"
            className="w-full"
            onClick={() => setDismissed(true)}
          >
            {t("address_distance_confirm")}
          </Button>
          <Button
            type="button"
            variant="soft"
            size="lg"
            className="w-full"
            onClick={handleChangeAddress}
          >
            {t("address_distance_change")}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default AddressDistanceModal;
