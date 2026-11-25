"use client";

import { useEffect, useSyncExternalStore } from "react";

type DeviceCoords = { latitude: number; longitude: number };

// Joylashuv butun sessiya davomida bir marta so'raladi. Telegram har bir
// getCurrentPosition chaqiruvida ruxsat oynasini qayta ko'rsatadi, shuning uchun
// natija (yoki rad etilgani) modul darajasida + sessionStorage'da saqlanadi va
// sahifalar orasida o'tganda qayta so'ralmaydi.
const STORAGE_KEY = "rb-device-location";

type LocationState =
  | { status: "idle" }
  | { status: "pending" }
  | { status: "done"; coords: DeviceCoords | null };

const readStored = (): LocationState => {
  if (typeof window === "undefined") return { status: "idle" };

  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return { status: "idle" };

    const parsed = JSON.parse(raw) as { coords: DeviceCoords | null };
    return { status: "done", coords: parsed.coords ?? null };
  } catch {
    return { status: "idle" };
  }
};

let state: LocationState | null = null;
const listeners = new Set<() => void>();

const getState = () => {
  if (!state) state = readStored();
  return state;
};

const setState = (next: LocationState) => {
  state = next;

  if (next.status === "done") {
    try {
      window.sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ coords: next.coords }),
      );
    } catch {
      // sessionStorage yopiq bo'lsa ham modul keshi ishlaydi
    }
  }

  listeners.forEach((listener) => listener());
};

const requestLocation = () => {
  if (getState().status !== "idle") return;

  if (!navigator.geolocation) {
    setState({ status: "done", coords: null });
    return;
  }

  setState({ status: "pending" });
  navigator.geolocation.getCurrentPosition(
    ({ coords }) =>
      setState({
        status: "done",
        coords: { latitude: coords.latitude, longitude: coords.longitude },
      }),
    () => setState({ status: "done", coords: null }),
    // Uzunroq timeout: foydalanuvchi ruxsat oynasida o'ylab turganda xato bo'lmasin
    { timeout: 30000, maximumAge: 300000 },
  );
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

const getCoords = () => {
  const current = getState();
  return current.status === "done" ? current.coords : null;
};

export const useDeviceLocation = (enabled: boolean) => {
  const coords = useSyncExternalStore(subscribe, getCoords, () => null);

  useEffect(() => {
    if (enabled) requestLocation();
  }, [enabled]);

  return coords;
};
