import { request } from "@/configs/requests";

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

export type AddressProps = CreateAddressPayload & {
  id: number;
};

export const createAddress = async (data: CreateAddressPayload) => {
  return await request.post<AddressProps[]>(
    "webapp/user/profile/address/create",
    [data],
  );
};
