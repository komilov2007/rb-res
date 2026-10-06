"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { createAddress, deleteAddress, getAddresses, updateAddress, updateAddressStatus } from "@/apis/address";
import { type AddressProps } from "@/types/address";
import { useLocationStore } from "@/stores/location";
import { useAuthStore } from "@/stores/auth";

import type { useAddressForm } from "./location-modal";
import { REACT_QUERY_KEYS } from "@/constants/react-query-keys";

const MAX_SAVED_ADDRESSES = 10;

type UseAddressMutationsProps = {
  addresses: AddressProps[] | undefined;
  onDone: () => void;
  addressName: string;
  editingAddressId: number | null;
  setEditingAddressId: (id: number | null) => void;
  getAddressPayload: ReturnType<typeof useAddressForm>["getAddressPayload"];
};

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
    queryClient.invalidateQueries({
      queryKey: [REACT_QUERY_KEYS.USER_ADDRESSES, customer],
    });
  };

  const createAddressMutation = useMutation({
    mutationFn: createAddress,
    onSuccess: async (response, variables) => {
      const createdId = response.data?.[0]?.id ?? null;
      let created: AddressProps | undefined;
      let staleIds: number[] = [];

      try {
        const fresh = await queryClient.fetchQuery({
          queryKey: [REACT_QUERY_KEYS.USER_ADDRESSES, variables.customer],
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

        staleIds = list
          .filter((item) => item.id !== created?.id)
          .sort((a, b) => a.id - b.id)
          .slice(0, Math.max(0, list.length - MAX_SAVED_ADDRESSES))
          .map((item) => item.id);
      } catch {
      }

      setAddress(created?.address ?? variables.address, {
        id: created?.id ?? createdId,
        latitude: variables.latitude,
        longitude: variables.longitude,
      });

      if (staleIds.length > 0) {
        const results = await Promise.allSettled(staleIds.map(deleteAddress));
        const deletedIds = staleIds.filter(
          (_, index) => results[index].status === "fulfilled",
        );

        queryClient.setQueryData<AxiosResponse<AddressProps[]>>(
          [REACT_QUERY_KEYS.USER_ADDRESSES, variables.customer],
          (old) =>
            old && {
              ...old,
              data: old.data.filter((item) => !deletedIds.includes(item.id)),
            },
        );
        deletedIds.forEach(clearAddressById);
      }

      invalidateAddresses(variables.customer);
      onDone();
    },
  });

  const updateAddressMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: Parameters<typeof updateAddress>[1];
    }) => updateAddress(id, data),
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
      queryClient.setQueryData<AxiosResponse<AddressProps[]>>(
        [REACT_QUERY_KEYS.USER_ADDRESSES, auth?.customer],
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
