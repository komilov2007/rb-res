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

// Confirmed live: POST webapp/check/delivery/{shop} with {lat, long} returns
// {is_allow} — the backend checks the point against the shop's DELIVERY
// service cities (Tashkent/Andijan allowed, Samarkand/Khiva rejected for a
// shop configured with two cities).
export type DeliveryCheckProps = {
  is_allow: boolean;
};
