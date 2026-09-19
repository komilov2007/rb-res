"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import type { YMapsApi } from "react-yandex-maps";

import {
  createAddress,
  deleteAddress,
  getAddresses,
  updateAddress,
  updateAddressStatus,
  type AddressProps,
} from "@/apis/address";
import { useLocationStore } from "@/stores/location";
import { useAuthStore } from "@/stores/auth";
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

type LocationScreen = "list" | "map" | "details";

const toNullableNumber = (value: string) => {
  const cleanValue = value.trim();

  return cleanValue ? Number(cleanValue) : null;
};

const toInputValue = (value: number | null) => {
  return value ? String(value) : "";
};

export const useLocationModal = () => {
  const queryClient = useQueryClient();
  const mapInstanceRef = useRef<MapInstance | null>(null);
  const geocodeRequestRef = useRef(0);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const programmaticMoveRef = useRef(false);
  const address = useLocationStore((state) => state.address);
  const setAddress = useLocationStore((state) => state.setAddress);
  const clearAddressById = useLocationStore((state) => state.clearAddressById);
  const editingAddress = useLocationStore((state) => state.editingAddress);
  const setEditingAddress = useLocationStore((state) => state.setEditingAddress);
  const locationModal = useLocationStore((state) => state.locationModal);
  const setLocationModal = useLocationStore((state) => state.setLocationModal);
  const auth = useAuthStore((state) => state.auth);
  const hasAccess = useAuthStore((state) => state.hasAccess);
  const [screen, setScreen] = useState<LocationScreen>("list");
  const [editingAddressId, setEditingAddressId] = useState<number | null>(null);
  const [addressName, setAddressName] = useState(address);
  const [isResolving, setIsResolving] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchAddress[]>([]);
  const [entrance, setEntrance] = useState("");
  const [floor, setFloor] = useState("");
  const [room, setRoom] = useState("");
  const [comment, setComment] = useState("");
  const [addressTitle, setAddressTitle] = useState("");
  const [zoom, setZoom] = useState(13);
  const [center, setCenter] = useState<Coordinates>(DEFAULT_CENTER);
  const [yandexKeyIndex, setYandexKeyIndex] = useState(0);
  const [mapRenderKey, setMapRenderKey] = useState(0);
  const mapState = useMemo(() => ({ zoom, center }), [zoom, center]);
  const yandexKey = YANDEX_KEYS[yandexKeyIndex];
  const addressesQuery = useQuery({
    enabled: hasAccess && Boolean(auth?.customer),
    queryKey: ["user-addresses", auth?.customer],
    queryFn: getAddresses,
  });
  const addresses = addressesQuery.data?.data;
  const currentAddress =
    addresses?.find((item) => item.is_current) ?? addresses?.[0] ?? null;
  const activeAddressId = editingAddressId ?? currentAddress?.id ?? null;

  const invalidateAddresses = (customer?: number) => {
    queryClient.invalidateQueries({ queryKey: ["user-addresses", customer] });
  };

  const createAddressMutation = useMutation({
    mutationFn: createAddress,
    // Selects the new address by the id the saved list actually holds — the
    // create response's own `[0].id` isn't reliably there, and a null id
    // left the new address unticked in the saved-addresses list. The list
    // is refetched (not just invalidated) so the lookup sees the new row;
    // match order: response id, then the exact coordinates just saved, then
    // the backend's current address (is_current: true was sent).
    onSuccess: async (response, variables) => {
      const createdId = response.data?.[0]?.id ?? null;
      let created: AddressProps | undefined;

      try {
        const fresh = await queryClient.fetchQuery({
          queryKey: ["user-addresses", variables.customer],
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
      } catch {
        // Fall back to what the create call itself gave us.
      }

      setAddress(created?.address ?? variables.address, {
        id: created?.id ?? createdId,
        latitude: variables.latitude,
        longitude: variables.longitude,
      });
      invalidateAddresses(variables.customer);
      handleClose();
    },
  });

  const updateAddressMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Parameters<typeof updateAddress>[1] }) =>
      updateAddress(id, data),
    onSuccess: (response, variables) => {
      const nextAddress = response.data.address || variables.data.address;

      setAddress(nextAddress, {
        id: response.data.id ?? variables.id,
        latitude: variables.data.latitude,
        longitude: variables.data.longitude,
      });
      invalidateAddresses(auth?.customer);
      handleClose();
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
      handleClose();
    },
  });

  const deleteAddressMutation = useMutation({
    mutationFn: deleteAddress,
    onSuccess: (_, id) => {
      // Same order as profile/addresses: drop it from the cached list before
      // clearing the store, so Location's "fall back to the current saved
      // address" effect can't re-select the deleted one from a stale list.
      queryClient.setQueryData<AxiosResponse<AddressProps[]>>(
        ["user-addresses", auth?.customer],
        (old) =>
          old && { ...old, data: old.data.filter((item) => item.id !== id) },
      );
      clearAddressById(id);
      invalidateAddresses(auth?.customer);
      handleClose();
    },
  });

  useEffect(() => {
    if (!locationModal || !editingAddress) return;

    fillAddressForm(editingAddress);
    setScreen("map");
    setEditingAddress(null);
  }, [editingAddress, locationModal, setEditingAddress]);

  const getYandexGeocode = (params: Record<string, string>) => {
    return requestYandexGeocode({
      params,
      keyIndex: yandexKeyIndex,
      setKeyIndex: setYandexKeyIndex,
    });
  };

  const fillAddressForm = (item?: AddressProps | null) => {
    setEditingAddressId(item?.id ?? null);
    setAddressName(item?.address ?? "");
    setAddressTitle(item?.name ?? "");
    setEntrance(toInputValue(item?.entrance ?? null));
    setFloor(toInputValue(item?.floor ?? null));
    setRoom(toInputValue(item?.room ?? null));
    setComment(item?.comment ?? "");

    if (item) {
      const coords: Coordinates = [item.longitude, item.latitude];

      setCenter(coords);
      setZoom(18);
      setMapRenderKey((key) => key + 1);
      mapInstanceRef.current?.setCenter(coords, 18, {
        duration: 500,
        timingFunction: "ease-in-out",
      });
    }
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

  function handleClose() {
    setSearchResults([]);
    setScreen("list");
    setEditingAddressId(null);
    setEditingAddress(null);
    setLocationModal(false)();
  }

  const handleAddAddress = () => {
    fillAddressForm(null);
    setCenter(DEFAULT_CENTER);
    setZoom(16);
    setMapRenderKey((key) => key + 1);
    setScreen("map");
    void setAddressByCoords(DEFAULT_CENTER);
  };

  // openLocationMap(): start directly on the map screen for a new address.
  // Reacts to the store change in a subscription callback rather than an
  // effect body, so no state is set synchronously during an effect.
  useEffect(
    () =>
      useLocationStore.subscribe((state, previousState) => {
        if (!state.locationMapRequest || previousState.locationMapRequest) {
          return;
        }

        state.clearLocationMapRequest();
        handleAddAddress();
      }),
    // Subscribed once; handleAddAddress only calls stable state setters.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const handleEditAddress = (item: AddressProps) => {
    fillAddressForm(item);
    setScreen("map");
  };

  const handleOpenDetails = () => {
    if (!addressName.trim() || isResolving) return;

    setScreen("details");
  };

  const handleBackToMap = () => {
    setScreen("map");
  };

  const getAddressPayload = () => ({
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

  const handleSubmit = () => {
    if (!addressName.trim()) return;

    const payload = getAddressPayload();

    if (!auth?.customer) {
      setAddress(payload.address, {
        id: null,
        latitude: payload.latitude,
        longitude: payload.longitude,
      });
      handleClose();
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

  const handleLoad = (_api: YMapsApi) => {
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

  const isPending =
    createAddressMutation.isPending ||
    updateAddressMutation.isPending ||
    updateCurrentMutation.isPending ||
    deleteAddressMutation.isPending;

  return {
    state: {
      activeAddressId,
      addressName,
      addressTitle,
      addresses,
      center,
      comment,
      detailsModal: screen === "details",
      editingAddressId,
      entrance,
      floor,
      isResolving,
      isSearching,
      locationModal,
      mapModal: screen === "map",
      mapRenderKey,
      mapState,
      room,
      screen,
      searchResults,
      yandexKey,
    },
    actions: {
      handleAddAddress,
      handleBackToMap,
      handleBoundsChange,
      handleChangeSearch,
      handleClose,
      handleDeleteAddress,
      handleEditAddress,
      handleLoad,
      handleOpenDetails,
      handleSearchCenter,
      handleSelectAddress,
      handleSelectSavedAddress,
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
      isCreateAddressPending: isPending,
    },
  };
};



