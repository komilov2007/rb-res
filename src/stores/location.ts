import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { AddressProps } from "@/apis/address";

type LocationCoords = {
  latitude: number;
  longitude: number;
};

type LocationAddressMeta = LocationCoords & {
  id?: number | null;
};

type LocationStoreProps = {
  addressId: number | null;
  address: string;
  editingAddress: AddressProps | null;
  latitude: number | null;
  longitude: number | null;
  locationModal: boolean;
  // Set by openLocationMap: the location modal opens straight on its map
  // screen (new address) instead of the saved-addresses list.
  locationMapRequest: boolean;
  setAddress: (address: string, meta?: LocationAddressMeta) => void;
  setEditingAddress: (address: AddressProps | null) => void;
  setLocationModal: (locationModal: boolean) => void;
  openLocationMap: () => void;
  clearLocationMapRequest: () => void;
  clearLocation: () => void;
  // Drops the selected delivery address only if it's the one with this id
  // — called after a saved address is deleted, so the persisted selection
  // doesn't keep pointing at an address that no longer exists.
  clearAddressById: (id: number) => void;
};

export const useLocationStore = create<LocationStoreProps>()(
  persist(
    (set) => ({
      addressId: null,
      address: "",
      editingAddress: null,
      latitude: null,
      longitude: null,
      locationModal: false,
      locationMapRequest: false,

      setAddress: (address, meta) => {
        set({
          addressId: meta?.id ?? null,
          address,
          latitude: meta?.latitude ?? null,
          longitude: meta?.longitude ?? null,
        });
      },

      setEditingAddress: (editingAddress) => {
        set({ editingAddress });
      },

      setLocationModal: (locationModal) => {
        set({ locationModal });
      },

      openLocationMap: () => {
        set({ locationModal: true, locationMapRequest: true });
      },

      clearLocationMapRequest: () => {
        set({ locationMapRequest: false });
      },

      clearLocation: () => {
        set({
          address: "",
          addressId: null,
          editingAddress: null,
          latitude: null,
          longitude: null,
          locationModal: false,
          locationMapRequest: false,
        });
      },

      clearAddressById: (id) => {
        set((state) =>
          state.addressId === id
            ? { address: "", addressId: null, latitude: null, longitude: null }
            : state,
        );
      },
    }),
    {
      name: "delivery-location",
      partialize: (state) => ({
        addressId: state.addressId,
        address: state.address,
        latitude: state.latitude,
        longitude: state.longitude,
      }),
    },
  ),
);
