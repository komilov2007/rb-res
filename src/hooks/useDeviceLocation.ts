"use client";

import { useEffect, useState } from "react";

type DeviceCoords = { latitude: number; longitude: number };

// Reads the device position once whenever `enabled` turns true. Stays null
// if geolocation is unavailable or denied (silently — callers treat it as
// "no origin known").
export const useDeviceLocation = (enabled: boolean) => {
  const [coords, setCoords] = useState<DeviceCoords | null>(null);

  useEffect(() => {
    if (!enabled || !navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      ({ coords: position }) =>
        setCoords({
          latitude: position.latitude,
          longitude: position.longitude,
        }),
      () => {},
      { timeout: 5000, maximumAge: 300000 },
    );
  }, [enabled]);

  return coords;
};
