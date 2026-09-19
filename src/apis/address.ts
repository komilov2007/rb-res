import { request } from "@/configs/requests";
import { getUser } from "@/lib/user";
import { isServer } from "@/utils/is-server";

export type CreateAddressPayload = {
  customer: number;
  address: string;
  latitude: number;
  longitude: number;
  name: string | null;
  entrance: number | null;
  floor: number | null;
  room: number | null;
  comment: string | null;
  is_current: boolean;
};

export type AddressFormPayload = Omit<CreateAddressPayload, "customer">;

export type AddressProps = CreateAddressPayload & {
  id: number;
};

const uzHeaders = { headers: { "Accept-Language": "uz" } };

// Confirmed live: POST webapp/check/delivery/{shop} with {lat, long} returns
// {is_allow} — the backend checks the point against the shop's DELIVERY
// service cities (Tashkent/Andijan allowed, Samarkand/Khiva rejected for a
// shop configured with two cities).
export type DeliveryCheckProps = {
  is_allow: boolean;
};

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
  return await request.delete(
    `webapp/user/profile/address/${id}/delete`,
    uzHeaders,
  );
};

export const getAddresses = async () => {
  if (isServer()) {
    return await request<AddressProps[]>("webapp/user/profile/my-addresses", uzHeaders);
  }

  const shopId = new URLSearchParams(window.location.search).get("shop_id");
  const user = getUser(shopId ?? "");

  return await request<AddressProps[]>(
    `webapp/user/profile/my-addresses/${user?.auth.customer}`,
    uzHeaders,
  );
};


