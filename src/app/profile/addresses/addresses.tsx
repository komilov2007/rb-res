"use client";

import { Suspense, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import { Edit3, MapPin, Plus, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";

import {
  deleteAddress,
  getAddresses,
  type AddressProps,
} from "@/apis/address";
import { getBranches } from "@/apis/branches";
import {
  findClosestBranch,
  getBranchLabel,
  getShortAddress,
} from "@/app/[page]/components/branch-selection/utils";
import Button from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { useShopid } from "@/hooks/useShopId";
import { useAuthStore } from "@/stores/auth";
import { useLocationStore } from "@/stores/location";

import LoginRequired from "../components/login-required";
import ProfilePageShell from "../components/profile-page-shell";

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
  const { shopid, hasShopId } = useShopid();
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
  const addressesQuery = useQuery({
    enabled: hasAccess && Boolean(auth?.customer),
    queryKey: ["user-addresses", auth?.customer],
    queryFn: getAddresses,
  });
  const { data: branchesData } = useQuery({
    enabled: hasShopId,
    queryKey: ["branches", shopid],
    queryFn: () => getBranches(shopid as string),
  });
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
    setLocationModal(true)();
  };

  const addButton = (
    <button
      type="button"
      onClick={openLocationMap}
      className="flex h-12 items-center justify-center gap-2 rounded-2xl border border-dashed border-primary/40 bg-white text-sm font-medium text-primary"
    >
      <Plus size={18} strokeWidth={2.4} />
      {t("profile_page.addresses.add_new")}
    </button>
  );

  if (!hasAccess) {
    return <LoginRequired message={t("profile_page.addresses.login_required")} />;
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
          {t("profile_page.addresses.empty_title")}
        </p>
        <p className="text-sm text-gray220">
          {t("profile_page.addresses.empty_hint")}
        </p>
        <Button
          type="button"
          variant="plain"
          size="none"
          onClick={openLocationMap}
          className="mt-1 h-11 gap-2 rounded-2xl bg-primary px-5 text-sm font-bold text-white"
        >
          <Plus size={16} strokeWidth={2.4} />
          {t("profile_page.addresses.add")}
        </Button>
      </div>
    );
  }

  return (
    <>
      {addresses.map((item) => {
        const branch = findClosestBranch(branches, item);

        return (
          <div
            key={item.id}
            data-address-row={item.id}
            className="flex items-center gap-3 rounded-2xl border border-gray180 bg-white p-3"
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gray10 text-gray220">
              <MapPin size={17} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex min-w-0 items-center gap-2">
                <span className="line-clamp-1 min-w-0 text-sm font-medium text-black">
                  {item.name || getShortAddress(item.address)}
                </span>
                {branch && (
                  <span className="shrink-0 whitespace-nowrap rounded-full bg-gray10 px-2 py-0.5 text-[11px] text-gray220">
                    {getBranchLabel(branch.name)}
                  </span>
                )}
              </div>
              <p className="mt-0.5 line-clamp-2 text-xs text-gray220">
                {item.address}
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleEdit(item)}
              aria-label={t("profile_page.addresses.edit_aria")}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gray10 text-gray220"
            >
              <Edit3 size={15} />
            </button>
            <button
              type="button"
              onClick={() => setDeleting(item)}
              aria-label={t("profile_page.addresses.delete_aria")}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-red/10 text-red"
            >
              <Trash2 size={15} />
            </button>
          </div>
        );
      })}

      {addButton}

      <Dialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
      >
        <DialogContent
          className="max-w-[340px] rounded-3xl bg-white p-5"
          showCloseButton={false}
        >
          <DialogTitle className="text-center text-xl font-bold text-black">
            {t("profile_page.addresses.delete_title")}
          </DialogTitle>
          <DialogDescription className="text-center text-sm font-normal text-gray220">
            {deleting ? getShortAddress(deleting.address) : ""}
          </DialogDescription>
          <div className="mt-2 grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant="secondary"
              size="lg"
              onClick={() => setDeleting(null)}
              className="rounded-2xl"
            >
              {t("common.cancel")}
            </Button>
            <Button
              type="button"
              variant="plain"
              size="lg"
              disabled={deleteMutation.isPending}
              onClick={() => deleting && deleteMutation.mutate(deleting.id)}
              className="rounded-2xl bg-red/10 text-red"
            >
              {t("common.delete")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

const Addresses = () => {
  const t = useTranslations();

  return (
    <ProfilePageShell title={t("profile_page.menu.addresses")}>
      {/* useSearchParams (shop_id) needs a Suspense boundary. */}
      <Suspense>
        <AddressesContent />
      </Suspense>
    </ProfilePageShell>
  );
};

export default Addresses;
