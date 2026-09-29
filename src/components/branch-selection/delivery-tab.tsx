"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";

import { updateAddressStatus, type AddressProps } from "@/apis/address";
import { useAuthStore } from "@/stores/auth";
import { useBranchSelectionStore } from "@/stores/branch-selection";
import { useLocationStore } from "@/stores/location";
import { useAddresses } from "@/hooks/useAddresses";
import RadioMark from "@/components/ui/radio-mark";

import { getShortAddress } from "./utils";
import {
  COLLAPSED_COUNT,
  getRowClassName,
  SectionLabel,
  RowIcon,
  Pill,
  RowText,
  ShowMoreToggle,
  BranchPill,
  NearestBranchPill,
  TabProps,
} from "./selection-parts";
import { REACT_QUERY_KEYS } from "@/constants/react-query-keys";

export const DeliveryTab = ({
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

  const { data: addresses } = useAddresses(auth?.customer, hasAccess && Boolean(auth?.customer));
  // Same "make it the current address" call the location modal makes.
  const currentMutation = useMutation({
    mutationFn: updateAddressStatus,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [REACT_QUERY_KEYS.USER_ADDRESSES, auth?.customer],
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
        className="flex min-h-16 w-full items-center gap-3 rounded-2xl border border-dashed border-primary/40 px-3 py-2.5 text-left transition-colors duration-200 hover:bg-primary10/60"
      >
        <RowIcon />
        <span className="min-w-0 flex-1 text-sm font-normal text-black">
          {t("home_branch_selection_new_address_placeholder")}
        </span>
        <Pill tone="primary">{t("home_branch_selection_map_pill")}</Pill>
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
            {t("home_branch_selection_saved_addresses", {
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
              {t("home_branch_selection_login_for_saved")}
            </p>
          ) : !addresses ? (
            // Row-sized skeletons, same box as a saved-address row.
            <div
              aria-label={t("home_branch_selection_addresses_loading")}
              className="flex flex-col gap-2"
            >
              {Array.from({ length: 2 }).map((_, index) => (
                <div key={index} className="skeleton h-16 w-full rounded-2xl" />
              ))}
            </div>
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
            labelKey="home_branch_selection_show_more_addresses"
            onToggle={() => setExpanded((value) => !value)}
          />
        </div>
      )}
    </>
  );
};
