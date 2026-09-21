"use client";

import { useMemo, useRef, useState } from "react";

import {
  DEFAULT_CENTER,
  YANDEX_ADDRESS_LANG,
  YANDEX_KEYS,
} from "@/constants/yandex";
import { requestYandexGeocode } from "@/utils/yandex";
import type {
  BoundsChangeEvent,
  Coordinates,
  MapInstance,
  SearchAddress,
  YandexGeocoderResponse,
} from "@/types/yandex";

// Map, reverse-geocode and address-search state of the location modal.
// `address` seeds the address input, as before.
export const useLocationMap = (address: string) => {
  const mapInstanceRef = useRef<MapInstance | null>(null);
  const geocodeRequestRef = useRef(0);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const programmaticMoveRef = useRef(false);
  const [addressName, setAddressName] = useState(address);
  const [isResolving, setIsResolving] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchAddress[]>([]);
  const [zoom, setZoom] = useState(13);
  const [center, setCenter] = useState<Coordinates>(DEFAULT_CENTER);
  const [yandexKeyIndex, setYandexKeyIndex] = useState(0);
  const [mapRenderKey, setMapRenderKey] = useState(0);
  const mapState = useMemo(() => ({ zoom, center }), [zoom, center]);
  const yandexKey = YANDEX_KEYS[yandexKeyIndex];
  const getYandexGeocode = (params: Record<string, string>) => {
    return requestYandexGeocode({
      params,
      keyIndex: yandexKeyIndex,
      setKeyIndex: setYandexKeyIndex,
    });
  };

  const setAddressByCoords = async (coords: Coordinates) => {
    const requestId = geocodeRequestRef.current + 1;
    geocodeRequestRef.current = requestId;
    setIsResolving(true);

    try {
      const data = await getYandexGeocode({
        format: "json",
        lang: YANDEX_ADDRESS_LANG,
        geocode: `${coords[0]},${coords[1]}`,
      });
      const nextAddress =
        data.response?.GeoObjectCollection?.featureMember?.[0]?.GeoObject
          ?.metaDataProperty?.GeocoderMetaData?.text;

      if (requestId === geocodeRequestRef.current && nextAddress) {
        setAddressName(nextAddress);
      }
    } finally {
      if (requestId === geocodeRequestRef.current) {
        setIsResolving(false);
      }
    }
  };
  const handleLoad = () => {
    if (!addressName) {
      void setAddressByCoords(center);
    }
  };

  const handleBoundsChange = (event: BoundsChangeEvent) => {
    if (programmaticMoveRef.current) return;

    const target = event.get?.("target") as
      | { getCenter?: () => Coordinates }
      | undefined;
    const newCoords =
      event.originalEvent?.newCenter ??
      target?.getCenter?.() ??
      mapInstanceRef.current?.getCenter();

    if (!newCoords) return;

    setCenter((prevCenter) =>
      prevCenter[0] === newCoords[0] && prevCenter[1] === newCoords[1]
        ? prevCenter
        : newCoords,
    );
    void setAddressByCoords(newCoords);
  };

  const handleUserCurrentLocation = () => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newCoords: Coordinates = [
          position.coords.longitude,
          position.coords.latitude,
        ];

        mapInstanceRef.current?.setCenter(newCoords, 18);
        setCenter(newCoords);
        setZoom(18);
        void setAddressByCoords(newCoords);
      },
      (error) => {
        alert(error.message);
      },
      { enableHighAccuracy: true, timeout: 5000 },
    );
  };

  const handleSearchCenter = (value = addressName) => {
    if (!value.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);

    getYandexGeocode({
      format: "json",
      lang: YANDEX_ADDRESS_LANG,
      geocode: value,
      results: "8",
    })
      .then((data: YandexGeocoderResponse) => {
        const items =
          data.response?.GeoObjectCollection?.featureMember
            ?.map((item) => {
              const object = item.GeoObject;
              const pos = object?.Point?.pos?.split(" ").map(Number);

              if (!object || !pos || pos.length < 2) return null;

              return {
                name: object.name ?? "",
                description: object.description ?? "",
                address: object.metaDataProperty?.GeocoderMetaData?.text ?? "",
                coords: [pos[0], pos[1]] as Coordinates,
              };
            })
            .filter((item): item is SearchAddress => Boolean(item)) ?? [];

        setSearchResults(items);
      })
      .finally(() => {
        setIsSearching(false);
      });
  };

  const handleSelectAddress = (item: SearchAddress) => {
    setAddressName(item.address || item.name);
    setSearchResults([]);
    programmaticMoveRef.current = true;
    mapInstanceRef.current?.setCenter(item.coords, 18, {
      duration: 600,
      timingFunction: "ease-in-out",
    });

    setCenter(item.coords);
    setZoom(18);
    setMapRenderKey((key) => key + 1);
    void setAddressByCoords(item.coords);

    setTimeout(() => {
      programmaticMoveRef.current = false;
    }, 800);
  };

  const handleChangeSearch = (value: string) => {
    setAddressName(value);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!value.trim()) {
      setSearchResults([]);
      return;
    }

    searchTimeoutRef.current = setTimeout(() => {
      handleSearchCenter(value);
    }, 400);
  };

  return {
    mapInstanceRef,
    addressName,
    setAddressName,
    isResolving,
    isSearching,
    searchResults,
    setSearchResults,
    center,
    setCenter,
    setZoom,
    mapRenderKey,
    setMapRenderKey,
    mapState,
    yandexKey,
    setAddressByCoords,
    handleLoad,
    handleBoundsChange,
    handleUserCurrentLocation,
    handleSearchCenter,
    handleSelectAddress,
    handleChangeSearch,
  };
};
