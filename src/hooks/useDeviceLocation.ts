"use client";

import { useEffect, useState } from "react";

type DeviceCoords = { latitude: number; longitude: number };

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
