import type { AddressFormPayload } from "@/types/address";

// Login qilmagan foydalanuvchi kiritgan manzillar shu qurilmada saqlanadi va
// login bo'lganda API'ga yuboriladi (rb-webapp: guest addresses → upload on login).
const STORAGE_KEY = "rb-guest-addresses";
const MAX_GUEST_ADDRESSES = 10;

export const getGuestAddresses = (): AddressFormPayload[] => {
  if (typeof window === "undefined") return [];

  try {
    const parsed: unknown = JSON.parse(
      window.localStorage.getItem(STORAGE_KEY) ?? "[]",
    );
    return Array.isArray(parsed) ? (parsed as AddressFormPayload[]) : [];
  } catch {
    return [];
  }
};

export const saveGuestAddress = (payload: AddressFormPayload) => {
  const rest = getGuestAddresses().filter(
    (item) =>
      item.latitude !== payload.latitude || item.longitude !== payload.longitude,
  );
  // Oxirgi kiritilgani joriy manzil bo'ladi
  const next = [
    ...rest.map((item) => ({ ...item, is_current: false })),
    { ...payload, is_current: true },
  ].slice(-MAX_GUEST_ADDRESSES);

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // storage to'la/yopiq — manzil baribir location store'da qoladi
  }
};

export const clearGuestAddresses = () => {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
};
