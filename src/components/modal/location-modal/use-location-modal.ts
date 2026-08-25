"use client";

import { useMemo, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import type { YMapsApi } from "react-yandex-maps";

import { createAddress } from "@/apis/address";
import { useLocationStore } from "@/store/location";
import { useAuthStore } from "@/store/auth";
import { DEFAULT_CENTER, YANDEX_KEYS, YANDEX_LANG } from "@/constants/yandex";
import { requestYandexGeocode } from "@/utils/yandex";
import type {
  BoundsChangeEvent,
  Coordinates,
  GeocodeResponse,
  MapInstance,
  SearchAddress,
  YandexGeocoderResponse,
} from "@/types/yandex";

const toNullableNumber = (value: string) => {
  const cleanValue = value.trim();

  return cleanValue ? Number(cleanValue) : null;
};

export const useLocationModal = () => {
  const [mapConstructor, setMapConstructor] = useState<YMapsApi | null>(null);
  const mapConstructorRef = useRef<YMapsApi | null>(null);
  const mapInstanceRef = useRef<MapInstance | null>(null);
  const geocodeRequestRef = useRef(0);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const programmaticMoveRef = useRef(false);
  const address = useLocationStore((state) => state.address);
  const [addressName, setAddressName] = useState(address);
  const [isResolving, setIsResolving] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchAddress[]>([]);
  const [entrance, setEntrance] = useState("");
  const [floor, setFloor] = useState("");
  const [room, setRoom] = useState("");
  const [comment, setComment] = useState("");
  const [addressTitle, setAddressTitle] = useState("");
  const [detailsModal, setDetailsModal] = useState(false);
  const [zoom, setZoom] = useState(13);
  const [center, setCenter] = useState<Coordinates>(DEFAULT_CENTER);
  const [yandexKeyIndex, setYandexKeyIndex] = useState(0);
  const [mapRenderKey, setMapRenderKey] = useState(0);
  const mapState = useMemo(() => ({ zoom, center }), [zoom, center]);
  const yandexKey = YANDEX_KEYS[yandexKeyIndex];
  const setAddress = useLocationStore((state) => state.setAddress);
  const locationModal = useLocationStore((state) => state.locationModal);
  const setLocationModal = useLocationStore((state) => state.setLocationModal);
  const auth = useAuthStore((state) => state.auth);
  const setLoginModal = useAuthStore((state) => state.setLoginModal);
  const createAddressMutation = useMutation({
    mutationFn: createAddress,
    onSuccess: (_, variables) => {
      setAddress(variables.address);
      handleClose();
    },
  });

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
    const api = mapConstructorRef.current ?? mapConstructor;
    const handleAddress = (nextAddress: unknown) => {
      if (requestId === geocodeRequestRef.current && nextAddress) {
        setAddressName(String(nextAddress));
      }
    };

    api?.geocode(coords).then((response: GeocodeResponse) => {
      const nearest = response?.geoObjects?.get(0);
      handleAddress(nearest?.properties?.get("text"));
    });

    try {
      const data = await getYandexGeocode({
        format: "json",
        lang: YANDEX_LANG,
        geocode: `${coords[0]},${coords[1]}`,
      });
      const address =
        data.response?.GeoObjectCollection?.featureMember?.[0]?.GeoObject
          ?.metaDataProperty?.GeocoderMetaData?.text;

      handleAddress(address);
    } finally {
      if (requestId === geocodeRequestRef.current) {
        setIsResolving(false);
      }
    }
  };

  function handleClose() {
    setSearchResults([]);
    setDetailsModal(false);
    setLocationModal(false)();
  }

  const handleOpenDetails = () => {
    if (!addressName.trim() || isResolving) return;

    setDetailsModal(true);
  };

  const handleBackToMap = () => {
    setDetailsModal(false);
  };

  const handleSubmit = () => {
    if (!addressName.trim() || createAddressMutation.isPending) return;
    if (!auth?.customer) {
      setLoginModal(true)();
      return;
    }

    createAddressMutation.mutate({
      customer: auth.customer,
      address: addressName,
      latitude: center[1],
      longitude: center[0],
      name: addressTitle.trim() || null,
      entrance: toNullableNumber(entrance),
      floor: toNullableNumber(floor),
      room: toNullableNumber(room),
      comment: comment.trim() || null,
      is_current: true,
    });
  };

  const handleLoad = (api: YMapsApi) => {
    setMapConstructor(api);
    mapConstructorRef.current = api;

    api.geocode(center).then((response: GeocodeResponse) => {
      const nearest = response?.geoObjects?.get(0);
      const nextAddress = nearest?.properties?.get("text");

      if (nextAddress) {
        setAddressName(String(nextAddress));
      }
    });
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
    setAddressByCoords(newCoords);
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
        setAddressByCoords(newCoords);
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
      lang: YANDEX_LANG,
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
    const mapInstance = mapInstanceRef.current;

    programmaticMoveRef.current = true;
    mapInstance?.setCenter(item.coords, 18, {
      duration: 600,
      timingFunction: "ease-in-out",
    });

    setCenter(item.coords);
    setZoom(18);
    setMapRenderKey((key) => key + 1);
    setAddressByCoords(item.coords);

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
    state: {
      addressName,
      addressTitle,
      center,
      comment,
      detailsModal,
      entrance,
      floor,
      isResolving,
      isSearching,
      locationModal,
      mapRenderKey,
      mapState,
      room,
      searchResults,
      yandexKey,
    },
    actions: {
      handleBoundsChange,
      handleBackToMap,
      handleChangeSearch,
      handleClose,
      handleLoad,
      handleOpenDetails,
      handleSearchCenter,
      handleSelectAddress,
      handleSubmit,
      handleUserCurrentLocation,
      setAddressTitle,
      setComment,
      setEntrance,
      setFloor,
      setLocationModal,
      setRoom,
    },
    refs: {
      mapInstanceRef,
    },
    status: {
      isCreateAddressPending: createAddressMutation.isPending,
    },
  };
};
