import { request } from "@/configs/requests";
import { getUser } from "@/utils/user";
import { getShopIdFromUrl, isServer } from "@/utils/is-server";
import type {
  AddressFormPayload,
  AddressProps,
  CreateAddressPayload,
  DeliveryCheckProps,
} from "@/types/address";

// Domain types live in types/address.ts; re-exported for existing importers.
export type {
  AddressFormPayload,
  AddressProps,
  CreateAddressPayload,
  DeliveryCheckProps,
};

const uzHeaders = { headers: { "Accept-Language": "uz" } };

export const checkDeliveryAddress = async (
  shopId: string,
  data: { lat: number; long: number },
) => {
  return await request.post<DeliveryCheckProps>(
    `webapp/check/delivery/${shopId}`,
    data,
  );
};

export const createAddress = async (data: CreateAddressPayload) => {
  return await request.post<AddressProps[]>(
    "webapp/user/profile/address/create",
    [data],
    uzHeaders,
  );
};

export const updateAddress = async (id: number, data: AddressFormPayload) => {
  return await request.put<AddressProps>(
    `webapp/user/profile/address/${id}/update`,
    data,
    uzHeaders,
  );
};

export const updateAddressStatus = async (id: number) => {
  return await request.post<AddressProps>(
    `webapp/user/profile/address/${id}/update/current`,
    undefined,
    uzHeaders,
  );
};

export const deleteAddress = async (id: number) => {
  return await request.delete<unknown>(
    `webapp/user/profile/address/${id}/delete`,
    uzHeaders,
  );
};

export const getAddresses = async () => {
  if (isServer()) {
    return await request<AddressProps[]>("webapp/user/profile/my-addresses", uzHeaders);
  }

  const user = getUser(getShopIdFromUrl());

  return await request<AddressProps[]>(
    `webapp/user/profile/my-addresses/${user?.auth.customer}`,
    uzHeaders,
  );
};

