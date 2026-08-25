import { create } from "zustand";
import { persist } from "zustand/middleware";

type LocationStoreProps = {
  address: string;
  locationModal: boolean;
  setAddress: (address: string) => void;
  setLocationModal: (locationModal: boolean) => () => void;
  clearLocation: () => void;
};

export const useLocationStore = create<LocationStoreProps>()(
  persist(
    (set) => ({
      address: "",
      locationModal: false,

      setAddress: (address) => {
        set({ address });
      },

      setLocationModal: (locationModal) => () => {
        set({ locationModal });
      },

      clearLocation: () => {
        set({
          address: "",
          locationModal: false,
        });
      },
    }),
    {
      name: "location",
      partialize: (state) => ({
        address: state.address,
      }),
    },
  ),
);
