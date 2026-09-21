"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import {
  createAddress,
  deleteAddress,
  getAddresses,
  updateAddress,
  updateAddressStatus,
  type AddressProps,
} from "@/apis/address";
import { useLocationStore } from "@/stores/location";
import { useAuthStore } from "@/stores/auth";

import type { useAddressForm } from "./useAddressForm";

type UseAddressMutationsProps = {
  addresses: AddressProps[] | undefined;
  // The modal's close — runs after every successful save/select/delete.
  onDone: () => void;
  addressName: string;
  editingAddressId: number | null;
  setEditingAddressId: (id: number | null) => void;
  getAddressPayload: ReturnType<typeof useAddressForm>["getAddressPayload"];
};

// Saving, selecting and deleting saved addresses. Every mutation updates the
// selected address in the location store, refreshes the saved list and then
// calls `onDone`.
export const useAddressMutations = ({
  addresses,
  onDone,
  addressName,
  editingAddressId,
  setEditingAddressId,
  getAddressPayload,
}: UseAddressMutationsProps) => {
  const t = useTranslations();
  const queryClient = useQueryClient();
  const setAddress = useLocationStore((state) => state.setAddress);
  const clearAddressById = useLocationStore((state) => state.clearAddressById);
  const auth = useAuthStore((state) => state.auth);

  const invalidateAddresses = (customer?: number) => {
    queryClient.invalidateQueries({ queryKey: ["user-addresses", customer] });
  };

  const createAddressMutation = useMutation({
    mutationFn: createAddress,
    // Selects the new address by the id the saved list actually holds — the
    // create response's own `[0].id` isn't reliably there, and a null id
    // left the new address unticked in the saved-addresses list. The list
    // is refetched (not just invalidated) so the lookup sees the new row;
    // match order: response id, then the exact coordinates just saved, then
    // the backend's current address (is_current: true was sent).
    onSuccess: async (response, variables) => {
      const createdId = response.data?.[0]?.id ?? null;
      let created: AddressProps | undefined;

      try {
        const fresh = await queryClient.fetchQuery({
          queryKey: ["user-addresses", variables.customer],
          queryFn: getAddresses,
        });
        const list = fresh.data ?? [];

        created =
          list.find((item) => item.id === createdId) ??
          list.find(
            (item) =>
              item.latitude === variables.latitude &&
              item.longitude === variables.longitude,
          ) ??
          list.find((item) => item.is_current);
      } catch {
        // Fall back to what the create call itself gave us.
      }

      setAddress(created?.address ?? variables.address, {
        id: created?.id ?? createdId,
        latitude: variables.latitude,
        longitude: variables.longitude,
      });
      invalidateAddresses(variables.customer);
      onDone();
    },
  });

  const updateAddressMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Parameters<typeof updateAddress>[1] }) =>
      updateAddress(id, data),
    onSuccess: (response, variables) => {
      const nextAddress = response.data.address || variables.data.address;

      setAddress(nextAddress, {
        id: response.data.id ?? variables.id,
        latitude: variables.data.latitude,
        longitude: variables.data.longitude,
      });
      invalidateAddresses(auth?.customer);
      toast.success(t("location_address_updated"));
      onDone();
    },
  });

  const updateCurrentMutation = useMutation({
    mutationFn: updateAddressStatus,
    onSuccess: (response, id) => {
      const selected =
        addresses?.find((item) => item.id === id) ?? response.data ?? null;

      if (selected) {
        setAddress(selected.address, {
          id: selected.id,
          latitude: selected.latitude,
          longitude: selected.longitude,
        });
      }
      invalidateAddresses(auth?.customer);
      onDone();
    },
  });

  const deleteAddressMutation = useMutation({
    mutationFn: deleteAddress,
    onSuccess: (_, id) => {
      // Same order as profile/addresses: drop it from the cached list before
      // clearing the store, so Location's "fall back to the current saved
      // address" effect can't re-select the deleted one from a stale list.
      queryClient.setQueryData<AxiosResponse<AddressProps[]>>(
        ["user-addresses", auth?.customer],
        (old) =>
          old && { ...old, data: old.data.filter((item) => item.id !== id) },
      );
      clearAddressById(id);
      invalidateAddresses(auth?.customer);
      onDone();
    },
  });

  const handleSubmit = () => {
    if (!addressName.trim()) return;

    const payload = getAddressPayload();

    if (!auth?.customer) {
      setAddress(payload.address, {
        id: null,
        latitude: payload.latitude,
        longitude: payload.longitude,
      });
      onDone();
      return;
    }

    if (editingAddressId) {
      updateAddressMutation.mutate({ id: editingAddressId, data: payload });
      return;
    }

    createAddressMutation.mutate({
      customer: auth.customer,
      ...payload,
    });
  };

  const handleDeleteAddress = () => {
    if (!editingAddressId || deleteAddressMutation.isPending) return;

    deleteAddressMutation.mutate(editingAddressId);
  };

  const handleSelectSavedAddress = (item: AddressProps) => {
    setEditingAddressId(item.id);
    setAddress(item.address, {
      id: item.id,
      latitude: item.latitude,
      longitude: item.longitude,
    });
    updateCurrentMutation.mutate(item.id);
  };

  const isPending =
    createAddressMutation.isPending ||
    updateAddressMutation.isPending ||
    updateCurrentMutation.isPending ||
    deleteAddressMutation.isPending;

  return {
    handleSubmit,
    handleDeleteAddress,
    handleSelectSavedAddress,
    isPending,
  };
};
