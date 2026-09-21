"use client";

import { Suspense, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import { MapPin, Plus } from "lucide-react";
import { useTranslations } from "next-intl";

import { deleteAddress, type AddressProps } from "@/apis/address";
import { findClosestBranch } from "@/components/branch-selection/utils";
import Button from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth";
import { useLocationStore } from "@/stores/location";
import { useBranches } from "@/hooks/useBranches";
import { useAddresses } from "@/hooks/useAddresses";

import LoginRequired from "../components/login-required";
import ProfilePageShell from "../components/profile-page-shell";
import AddressRow from "./components/address-row";
import DeleteAddressDialog from "./components/delete-address-dialog";

const AddressRowSkeleton = () => (
  <div className="flex animate-pulse items-center gap-3 rounded-2xl border border-gray180 bg-white p-3">
    <div className="h-9 w-9 shrink-0 rounded-full bg-gray10" />
    <div className="min-w-0 flex-1 space-y-2">
      <div className="h-4 w-28 rounded-full bg-gray10" />
      <div className="h-3 w-full rounded-full bg-gray10" />
    </div>
  </div>
);

const AddressesContent = () => {
  const t = useTranslations();
  const queryClient = useQueryClient();
  const auth = useAuthStore((state) => state.auth);
  const hasAccess = useAuthStore((state) => state.hasAccess);
  const setEditingAddress = useLocationStore(
    (state) => state.setEditingAddress,
  );
  const setLocationModal = useLocationStore((state) => state.setLocationModal);
  const openLocationMap = useLocationStore((state) => state.openLocationMap);
  const clearAddressById = useLocationStore((state) => state.clearAddressById);
  const [deleting, setDeleting] = useState<AddressProps | null>(null);

  // Same saved-addresses query as the address/branch selection modal.
  const addressesQuery = useAddresses(
    auth?.customer,
    hasAccess && Boolean(auth?.customer),
  );
  const { data: branchesData } = useBranches();
  const deleteMutation = useMutation({
    mutationFn: deleteAddress,
    onSuccess: (_, id) => {
      setDeleting(null);
      // Drop it from the cached list first, then from the selected-address
      // store: home's Location falls back to the list's current address
      // whenever the store is empty, and with the stale list still holding
      // the deleted address it would immediately re-select it.
      queryClient.setQueryData<AxiosResponse<AddressProps[]>>(
        ["user-addresses", auth?.customer],
        (old) =>
          old && { ...old, data: old.data.filter((item) => item.id !== id) },
      );
      clearAddressById(id);
      void queryClient.invalidateQueries({
        queryKey: ["user-addresses", auth?.customer],
      });
    },
  });

  const addresses = addressesQuery.data?.data ?? [];
  const branches =
    branchesData?.data.filter((branch) => branch.is_active) ?? [];

  // Edit/add reuse the location modal's own flows: editing opens it on the
  // map with the address filled in, adding opens it straight on the map.
  const handleEdit = (item: AddressProps) => {
    setEditingAddress(item);
    setLocationModal(true);
  };

  const addButton = (
    <button
      type="button"
      onClick={openLocationMap}
      className="flex h-12 items-center justify-center gap-2 rounded-2xl border border-dashed border-primary/40 bg-white text-sm font-medium text-primary"
    >
      <Plus size={18} strokeWidth={2.4} />
      {t("profile_page_addresses_add_new")}
    </button>
  );

  if (!hasAccess) {
    return (
      <LoginRequired message={t("profile_page_addresses_login_required")} />
    );
  }

  if (addressesQuery.isLoading) {
    return (
      <>
        <AddressRowSkeleton />
        <AddressRowSkeleton />
        <AddressRowSkeleton />
      </>
    );
  }

  if (addresses.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-gray180 bg-white px-6 py-10 text-center">
        <span className="grid h-14 w-14 place-items-center rounded-full bg-gray10 text-gray220">
          <MapPin size={24} />
        </span>
        <p className="text-base font-bold text-black">
          {t("profile_page_addresses_empty_title")}
        </p>
        <p className="text-sm text-gray220">
          {t("profile_page_addresses_empty_hint")}
        </p>
        <Button
          type="button"
          variant="plain"
          size="none"
          onClick={openLocationMap}
          className="mt-1 h-11 gap-2 rounded-2xl bg-primary px-5 text-sm font-bold text-white"
        >
          <Plus size={16} strokeWidth={2.4} />
          {t("profile_page_addresses_add")}
        </Button>
      </div>
    );
  }

  return (
    <>
      {addresses.map((item) => (
        <AddressRow
          key={item.id}
          item={item}
          branch={findClosestBranch(branches, item)}
          onEdit={() => handleEdit(item)}
          onDelete={() => setDeleting(item)}
        />
      ))}

      {addButton}

      <DeleteAddressDialog
        address={deleting}
        isDeleting={deleteMutation.isPending}
        onCancel={() => setDeleting(null)}
        onConfirm={(address) => deleteMutation.mutate(address.id)}
      />
    </>
  );
};

const Addresses = () => {
  const t = useTranslations();

  return (
    <ProfilePageShell title={t("profile_page_menu_addresses")}>
      {/* useSearchParams (shop_id) needs a Suspense boundary. */}
      <Suspense>
        <AddressesContent />
      </Suspense>
    </ProfilePageShell>
  );
};

export default Addresses;
