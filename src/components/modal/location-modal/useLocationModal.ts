"use client";

import { useEffect, useState } from "react";

import { type AddressProps } from "@/apis/address";
import { useLocationStore } from "@/stores/location";
import { useAuthStore } from "@/stores/auth";
import { DEFAULT_CENTER } from "@/constants/yandex";
import { useAddresses } from "@/hooks/useAddresses";

import { useAddressForm } from "./useAddressForm";
import { useAddressMutations } from "./useAddressMutations";
import { useLocationMap } from "./useLocationMap";

type LocationScreen = "list" | "map" | "details";

export const useLocationModal = () => {
  const address = useLocationStore((state) => state.address);
  const {
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
  } = useLocationMap(address);
  const editingAddress = useLocationStore((state) => state.editingAddress);
  const setEditingAddress = useLocationStore((state) => state.setEditingAddress);
  const locationModal = useLocationStore((state) => state.locationModal);
  const setLocationModal = useLocationStore((state) => state.setLocationModal);
  const auth = useAuthStore((state) => state.auth);
  const hasAccess = useAuthStore((state) => state.hasAccess);
  const [screen, setScreen] = useState<LocationScreen>("list");
  const {
    editingAddressId,
    setEditingAddressId,
    entrance,
    setEntrance,
    floor,
    setFloor,
    room,
    setRoom,
    comment,
    setComment,
    addressTitle,
    setAddressTitle,
    fillAddressForm,
    getAddressPayload,
  } = useAddressForm({
    mapInstanceRef,
    addressName,
    setAddressName,
    center,
    setCenter,
    setZoom,
    setMapRenderKey,
  });
  const addressesQuery = useAddresses(auth?.customer, hasAccess && Boolean(auth?.customer));
  const addresses = addressesQuery.data?.data;
  const currentAddress =
    addresses?.find((item) => item.is_current) ?? addresses?.[0] ?? null;
  const activeAddressId = editingAddressId ?? currentAddress?.id ?? null;

  const {
    handleSubmit,
    handleDeleteAddress,
    handleSelectSavedAddress,
    isPending,
  } = useAddressMutations({
    addresses,
    onDone: handleClose,
    addressName,
    editingAddressId,
    setEditingAddressId,
    getAddressPayload,
  });

  // Opening the modal for an existing address (set elsewhere through the
  // location store) loads it into the form once, then clears the request.
  // This has to be an effect: it clears the request in another store and
  // moves the Yandex map through a ref, neither of which may run during
  // render — so the synchronous setState rule is suppressed on purpose.
  useEffect(() => {
    if (!locationModal || !editingAddress) return;

    fillAddressForm(editingAddress);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setScreen("map");
    setEditingAddress(null);
  }, [editingAddress, locationModal, setEditingAddress, fillAddressForm]);

  function handleClose() {
    setSearchResults([]);
    setScreen("list");
    setEditingAddressId(null);
    setEditingAddress(null);
    setLocationModal(false);
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

