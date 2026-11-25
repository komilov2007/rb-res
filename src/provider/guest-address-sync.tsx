"use client";

import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { createAddress, getAddresses } from "@/apis/address";
import { REACT_QUERY_KEYS } from "@/constants/react-query-keys";
import { useAuthStore } from "@/stores/auth";
import { useLocationStore } from "@/stores/location";
import { clearGuestAddresses, getGuestAddresses } from "@/utils/guest-address";

// Login bo'lgan zahoti mehmon sifatida kiritilgan manzillarni API'ga yuboradi,
// so'ng joriy manzilni server id'si bilan location store'ga yozadi.
const GuestAddressSync = () => {
  const customer = useAuthStore((state) => state.auth?.customer);
  const queryClient = useQueryClient();
  const syncingRef = useRef(false);

  useEffect(() => {
    if (!customer || syncingRef.current) return;

    const guestAddresses = getGuestAddresses();
    if (guestAddresses.length === 0) return;

    syncingRef.current = true;

    const sync = async () => {
      try {
        // Backend bir so'rovda bittadan oladi (createAddress [data] yuboradi)
        for (const address of guestAddresses) {
          await createAddress({ customer, ...address });
        }
        clearGuestAddresses();

        const fresh = await queryClient.fetchQuery({
          queryKey: [REACT_QUERY_KEYS.USER_ADDRESSES, customer],
          queryFn: getAddresses,
          staleTime: 0,
        });
        const current = fresh.data?.find((item) => item.is_current);

        if (current) {
          useLocationStore.getState().setAddress(current.address, {
            id: current.id,
            latitude: current.latitude,
            longitude: current.longitude,
          });
        }
      } catch {
        // Keyingi login/yangilanishda qayta urinib ko'riladi
      } finally {
        syncingRef.current = false;
      }
    };

    void sync();
  }, [customer, queryClient]);

  return null;
};

export default GuestAddressSync;
