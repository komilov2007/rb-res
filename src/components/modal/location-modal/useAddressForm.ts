"use client";

import { useCallback, useState } from "react";

import { type AddressProps } from "@/apis/address";
import type { Coordinates } from "@/types/yandex";

import type { useLocationMap } from "./useLocationMap";

const toNullableNumber = (value: string) => {
  const cleanValue = value.trim();

  return cleanValue ? Number(cleanValue) : null;
};

const toInputValue = (value: number | null) => {
  return value ? String(value) : "";
};

type AddressFormMap = Pick<
  ReturnType<typeof useLocationMap>,
  | "mapInstanceRef"
  | "addressName"
  | "setAddressName"
  | "center"
  | "setCenter"
  | "setZoom"
  | "setMapRenderKey"
>;

// The address details form (title, entrance/floor/room, comment) plus
// loading an existing address into it and building the save payload.
export const useAddressForm = ({
  mapInstanceRef,
  addressName,
  setAddressName,
  center,
  setCenter,
  setZoom,
  setMapRenderKey,
}: AddressFormMap) => {
  const [editingAddressId, setEditingAddressId] = useState<number | null>(null);
  const [entrance, setEntrance] = useState("");
  const [floor, setFloor] = useState("");
  const [room, setRoom] = useState("");
  const [comment, setComment] = useState("");
  const [addressTitle, setAddressTitle] = useState("");

  // Only state setters and a ref inside (all stable), so it can sit in the
  // edit-address effect's deps without re-triggering it.
  const fillAddressForm = useCallback((item?: AddressProps | null) => {
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
  }, [mapInstanceRef, setAddressName, setCenter, setMapRenderKey, setZoom]);

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

  return {
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
  };
};
