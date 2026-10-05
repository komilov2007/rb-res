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

export type DeliveryCheckProps = {
  is_allow: boolean;
};
