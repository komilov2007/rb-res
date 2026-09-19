"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, ChevronDown, ChevronUp, MapPin } from "lucide-react";
import { useTranslations } from "next-intl";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { BranchMapPicker } from "@/components/branch-map-picker";
import {
  getAddresses,
  updateAddressStatus,
  type AddressProps,
} from "@/apis/address";
import { getNearestBranch } from "@/apis/branches";
import { useBoolean } from "@/hooks/useBoolean";
import { useGeneral } from "@/hooks/useGeneral";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useAuthStore } from "@/stores/auth";
import {
  useBranchSelectionStore,
  type BranchSelectionServiceType,
} from "@/stores/branch-selection";
import { useCartStore } from "@/stores/cart";
import { useLocationStore } from "@/stores/location";
import type { BranchProps } from "@/types/branch";
import type { GeneralProps } from "@/types/general";
import { getDistanceKm } from "@/utils/distance";

import {
  useBranchSelection,
  type BranchSelectionState,
} from "./useBranchSelection";
import { findClosestBranch, getBranchLabel, getShortAddress } from "./utils";

// Rows shown before the "Yana N ta ... ko'rsatish" toggle.
const COLLAPSED_COUNT = 3;

const TABS: { value: BranchSelectionServiceType; label: string }[] = [
  { value: "DELIVERY", label: "home.branch_selection.tab_delivery" },
  { value: "PICKUP", label: "home.branch_selection.tab_pickup" },
];

const getRowClassName = (checked: boolean) =>
  `flex min-h-16 w-full items-center gap-3 rounded-2xl border px-3 py-2.5 text-left transition-colors ${
    checked ? "border-black bg-gray10" : "border-gray180 hover:border-gray220"
  }`;

const SectionLabel = ({ children }: { children: ReactNode }) => (
  <p className="text-[11px] font-normal  tracking-wider text-gray220">
    {children}
  </p>
);

// tone="primary" (the default) is only for the standalone "Yangi manzil
// kiriting..." row above the saved-addresses list — every row *inside*
// that list uses tone="gray" so a plain list item doesn't read as visually
// "special" the way that one dedicated action row is meant to.
const RowIcon = ({ tone = "primary" }: { tone?: "primary" | "gray" }) => (
  <span
    className={`grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gray10 ${
      tone === "primary" ? "text-primary" : "text-gray220"
    }`}
  >
    <MapPin size={17} />
  </span>
);

const RadioMark = ({ checked }: { checked: boolean }) => (
  <span
    className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 ${
      checked
        ? "border-primary bg-primary text-white"
        : "border-gray180 bg-white"
    }`}
  >
    {checked && <Check size={14} strokeWidth={3} />}
  </span>
);

const Pill = ({
  children,
  tone = "gray",
}: {
  children: ReactNode;
  tone?: "gray" | "primary";
}) => (
  <span
    className={`shrink-0 whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-normal ${
      tone === "primary"
        ? "bg-primary10 text-primary"
        : "bg-gray10 text-gray220"
    }`}
  >
    {children}
  </span>
);

// line-clamp (not `truncate`) keeps normal wrapping, so the ellipsis lands
// after the last whole word that fits instead of cutting a word in half.
const RowText = ({
  title,
  pill,
  description,
}: {
  title: string;
  pill?: ReactNode;
  description?: string | null;
}) => (
  <span className="min-w-0 flex-1">
    <span className="flex min-w-0 items-center gap-2">
      <span className="line-clamp-1 min-w-0 text-sm font-medium text-gray220">
        {title}
      </span>
      {pill}
    </span>
    {description && (
      <span className="mt-0.5 line-clamp-1 text-xs font-normal text-gray220">
        {description}
      </span>
    )}
  </span>
);

const ShowMoreToggle = ({
  total,
  expanded,
  labelKey,
  onToggle,
}: {
  total: number;
  expanded: boolean;
  labelKey: string;
  onToggle: () => void;
}) => {
  const t = useTranslations();

  if (total <= COLLAPSED_COUNT) return null;

  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex h-10 items-center justify-center gap-1 rounded-xl bg-gray10 text-sm font-medium text-black"
    >
      {expanded ? (
        <>
          {t("common.show_less")}
          <ChevronUp size={16} />
        </>
      ) : (
        <>
          {t(labelKey, { count: total - COLLAPSED_COUNT })}
          <ChevronDown size={16} />
        </>
      )}
    </button>
  );
};

const BranchPill = ({ branch }: { branch: BranchProps | null }) =>
  branch ? <Pill>{getBranchLabel(branch.name)}</Pill> : null;

// The branch that will actually serve this address — the backend's own
// nearest-branch answer (same key/fn as useBranchSelection and the order
// page, so the selected address is a shared cache hit), not a client-side
// distance guess: some branches share identical coordinates, and the
// haversine tie-break then disagreed with the backend's pick.
const NearestBranchPill = ({
  selection,
  address,
}: {
  selection: BranchSelectionState;
  address: AddressProps;
}) => {
  const { data, isError } = useQuery({
    enabled: Boolean(selection.shopid),
    queryKey: [
      "nearest-branch",
      selection.shopid,
      address.latitude,
      address.longitude,
    ],
    queryFn: () =>
      getNearestBranch({
        shopid: selection.shopid as string,
        latitude: address.latitude,
        longitude: address.longitude,
      }),
  });

  const branch = data
    ? (selection.branches.find((item) => item.id === data.data.id) ?? null)
    : isError
      ? findClosestBranch(selection.branches, address)
      : null;

  return <BranchPill branch={branch} />;
};

type TabProps = {
  selection: BranchSelectionState;
  workingTime?: GeneralProps["working_time"];
};

const DeliveryTab = ({
  selection,
  onOpenMap,
}: TabProps & { onOpenMap: () => void }) => {
  const t = useTranslations();
  const queryClient = useQueryClient();
  const auth = useAuthStore((state) => state.auth);
  const hasAccess = useAuthStore((state) => state.hasAccess);
  const address = useLocationStore((state) => state.address);
  const addressId = useLocationStore((state) => state.addressId);
  const setAddress = useLocationStore((state) => state.setAddress);
  const setDelivery = useBranchSelectionStore((state) => state.setDelivery);
  const setSelectionModal = useBranchSelectionStore(
    (state) => state.setSelectionModal,
  );
  const [expanded, setExpanded] = useState(false);

  const { data: addresses } = useQuery({
    enabled: hasAccess && Boolean(auth?.customer),
    queryKey: ["user-addresses", auth?.customer],
    queryFn: getAddresses,
  });
  // Same "make it the current address" call the location modal makes.
  const currentMutation = useMutation({
    mutationFn: updateAddressStatus,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["user-addresses", auth?.customer],
      });
    },
  });

  const savedAddresses = addresses?.data ?? [];
  const visibleAddresses = expanded
    ? savedAddresses
    : savedAddresses.slice(0, COLLAPSED_COUNT);
  const isDeliverySelected = selection.serviceType === "DELIVERY";
  // A selected delivery address that isn't a saved one (a guest's map pick)
  // still shows as the selected entry.
  const hasUnsavedSelection =
    isDeliverySelected &&
    Boolean(address) &&
    !savedAddresses.some((item) => item.id === addressId);

  const handleSelect = (item: AddressProps) => {
    if (!selection.shopid) return;

    setAddress(item.address, {
      id: item.id,
      latitude: item.latitude,
      longitude: item.longitude,
    });
    setDelivery(selection.shopid);
    currentMutation.mutate(item.id);
    // A pick is final — close right away.
    setSelectionModal(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={onOpenMap}
        className={getRowClassName(false)}
      >
        <RowIcon />
        <span className="min-w-0 flex-1 text-sm font-normal text-gray220">
          {t("home.branch_selection.new_address_placeholder")}
        </span>
        <Pill tone="primary">{t("home.branch_selection.map_pill")}</Pill>
      </button>

      {/* No saved addresses (and nothing picked): the "Yangi manzil
          kiriting" row above is the whole tab — no empty section header
          or "none saved" note under it. */}
      {!(
        hasAccess &&
        addresses &&
        savedAddresses.length === 0 &&
        !hasUnsavedSelection
      ) && (
        <div className="flex flex-col gap-2">
          <SectionLabel>
            {t("home.branch_selection.saved_addresses", {
              count: savedAddresses.length,
            })}
          </SectionLabel>

          {hasUnsavedSelection && (
            <div className={getRowClassName(true)}>
              <RowIcon tone="gray" />
              <RowText
                title={getShortAddress(address)}
                pill={<BranchPill branch={selection.branch} />}
              />
              <RadioMark checked />
            </div>
          )}

          {!hasAccess ? (
            <p className="py-2 text-sm font-normal text-gray220">
              {t("home.branch_selection.login_for_saved")}
            </p>
          ) : !addresses ? (
            <p className="py-2 text-sm font-normal text-gray220">
              {t("home.branch_selection.addresses_loading")}
            </p>
          ) : (
            visibleAddresses.map((item) => {
              const checked = isDeliverySelected && addressId === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelect(item)}
                  className={getRowClassName(checked)}
                >
                  <RowIcon tone="gray" />
                  <RowText
                    title={item.name || getShortAddress(item.address)}
                    pill={
                      <NearestBranchPill selection={selection} address={item} />
                    }
                  />
                  <RadioMark checked={checked} />
                </button>
              );
            })
          )}

          <ShowMoreToggle
            total={savedAddresses.length}
            expanded={expanded}
            labelKey="home.branch_selection.show_more_addresses"
            onToggle={() => setExpanded((value) => !value)}
          />
        </div>
      )}
    </>
  );
};

const PickupTab = ({ selection, workingTime }: TabProps) => {
  const t = useTranslations();
  const latitude = useLocationStore((state) => state.latitude);
  const longitude = useLocationStore((state) => state.longitude);
  const setPickup = useBranchSelectionStore((state) => state.setPickup);
  const setSelectionModal = useBranchSelectionStore(
    (state) => state.setSelectionModal,
  );
  const [expanded, setExpanded] = useState(false);
  const mapPicker = useBoolean();
  const [deviceCoords, setDeviceCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const hasAddressCoords = latitude !== null && longitude !== null;

  // Without a saved delivery point, distances fall back to the device
  // location (silently skipped if unavailable or denied).
  useEffect(() => {
    if (hasAddressCoords || !navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      ({ coords }) =>
        setDeviceCoords({
          latitude: coords.latitude,
          longitude: coords.longitude,
        }),
      () => {},
      { timeout: 5000, maximumAge: 300000 },
    );
  }, [hasAddressCoords]);

  const origin =
    latitude !== null && longitude !== null
      ? { latitude, longitude }
      : deviceCoords;
  // Nearest first; API order when no origin is known.
  const branches = selection.branches
    .map((branch) => ({
      branch,
      km: origin ? getDistanceKm(origin, branch) : null,
    }))
    .sort((a, b) => (a.km ?? 0) - (b.km ?? 0));
  const visibleBranches = expanded
    ? branches
    : branches.slice(0, COLLAPSED_COUNT);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-3">
        <SectionLabel>
          {t("home.branch_selection.available_branches")}
        </SectionLabel>
        <button
          type="button"
          onClick={mapPicker.setTrue}
          className="flex shrink-0 items-center gap-1 text-xs font-bold text-primary"
        >
          <MapPin size={14} />
          {t("home.branch_selection.pick_on_map")}
        </button>
      </div>

      {branches.length === 0 && (
        <p className="py-2 text-sm font-normal text-gray220">
          {t("home.branch_selection.branches_not_found")}
        </p>
      )}

      {visibleBranches.map(({ branch }) => {
        const checked =
          selection.serviceType === "PICKUP" &&
          selection.branchId === branch.id;

        return (
          <button
            key={branch.id}
            type="button"
            onClick={() => {
              if (!selection.shopid) return;

              setPickup(selection.shopid, branch.id);
              // A pick is final — close right away.
              setSelectionModal(false);
            }}
            className={getRowClassName(checked)}
          >
            <RowText
              title={getBranchLabel(branch.name)}
              description={branch.address}
            />
            <RadioMark checked={checked} />
          </button>
        );
      })}

      <ShowMoreToggle
        total={branches.length}
        expanded={expanded}
        labelKey="home.branch_selection.show_more_branches"
        onToggle={() => setExpanded((value) => !value)}
      />

      <BranchMapPicker
        open={mapPicker.value}
        onClose={mapPicker.setFalse}
        branches={selection.branches}
        workingTime={workingTime}
        value={selection.serviceType === "PICKUP" ? selection.branchId : null}
        onSelect={(branchId) => {
          if (!selection.shopid) return;

          setPickup(selection.shopid, branchId);
          // A pick is final — close right away, same as the list rows above.
          setSelectionModal(false);
        }}
      />
    </div>
  );
};

type SelectionContentProps = TabProps & {
  canDeliver: boolean;
  canPickup: boolean;
  onOpenMap: () => void;
};

// Mounted fresh on every open (Dialog unmounts closed content), so the tab
// starts on the current selection.
const SelectionContent = ({
  selection,
  canDeliver,
  canPickup,
  onOpenMap,
  workingTime,
}: SelectionContentProps) => {
  const t = useTranslations();
  const [tab, setTab] = useState<BranchSelectionServiceType>(
    selection.serviceType ?? (canDeliver ? "DELIVERY" : "PICKUP"),
  );
  const tabs = TABS.filter((item) =>
    item.value === "DELIVERY" ? canDeliver : canPickup,
  );

  return (
    // w-full/min-w-0: DialogContent is a grid, whose items otherwise grow to
    // fit the longest unwrapped line.
    <div className="flex max-h-[85dvh] w-full min-w-0 flex-col">
      <div className="shrink-0 border-b border-gray180 px-5 pb-4 pr-14 pt-5">
        <DialogTitle className="text-lg font-bold text-black">
          {t("home.branch_selection.title")}
        </DialogTitle>
      </div>

      <div className="flex min-h-0 flex-col gap-4 overflow-y-auto p-5">
        {tabs.length > 1 && (
          <div className="grid grid-cols-2 gap-1 rounded-2xl bg-gray10 p-1">
            {tabs.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setTab(item.value)}
                className={`h-10 rounded-xl border text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-black/20 ${
                  tab === item.value
                    ? "border-gray180 bg-white font-bold text-black"
                    : "border-transparent text-gray220"
                }`}
              >
                {t(item.label)}
              </button>
            ))}
          </div>
        )}

        {tab === "DELIVERY" ? (
          <DeliveryTab selection={selection} onOpenMap={onOpenMap} />
        ) : (
          <PickupTab selection={selection} workingTime={workingTime} />
        )}
      </div>
    </div>
  );
};

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
  const locationModal = useLocationStore((state) => state.locationModal);
  const storeAddress = useLocationStore((state) => state.address);
  const openLocationMap = useLocationStore((state) => state.openLocationMap);
  // Address before the map picker opened; non-null while the picker is open.
  const mapReturnRef = useRef<string | null>(null);
  // Choosing requires login: a request made while logged out (home auto-open,
  // order-page redirect) waits, and shows only after login and the name step
  // are closed — never for a guest, never on top of the auth modals.
  const isVisible = selectionModal && hasAccess && !loginModal && !signupModal;

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
      workingTime={general?.data?.working_time}
    />
  );

  if (isDesktop) {
    return (
      <Dialog open={isVisible} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-[460px] gap-0 overflow-hidden rounded-3xl border border-gray180 bg-white p-0">
          {content}
        </DialogContent>
      </Dialog>
    );
  }

  // Mobile: bottom drawer. Sheet is the same Radix Dialog primitive, so
  // DialogTitle inside SelectionContent still works.
  return (
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
  );
};

export default BranchSelectionModal;
