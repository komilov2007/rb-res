// Order form delivery_type — the same value set as general.services[].type
// and the order's service_type (see ServiceTypeValue below).
export type DeliveryType = ServiceTypeValue;

export type PaymentTypeProps =
  | "CASH"
  | "CARD"
  | "UZUM"
  | "PAYME"
  | "CLICK"
  | "PAYME_API"
  | "CLICK_API"
  | "GLOBAL_PAY"
  | "UZUM_NASIYA"
  | "ALIF_NASIYA"
  | "BANK"
  | "ROBO_PAY"
  | "ROBO_CLICK"
  | "ROBO_PAYME"
  | "ROBO_UZUM";

export type OrderFormValues = {
  delivery_type: DeliveryType | null;
  payment_type: PaymentTypeProps | null;
  branch: number | null;
  // Id of the active saved address (autofilled from the location store).
  address: number | null;
  room: number | null;
  floor: number | null;
  entrance: number | null;
  comment: string | null;
  spend_cashback: boolean;
  promocode_id: number | null;
  promocode: string | null;
  // Backend's promo-discounted cart total (promo-code total_amount).
  total: number | null;
  shipping_date: string | null;
  shipping_time: string | null;
  delivery_price: number | null;
  delivery_price_type: string | null;
};

// STEP 28 — My Orders / order detail feature.

// Confirmed live against the my-orders list endpoint (including the two
// provider-delivery values).
export type ServiceTypeValue =
  | "DELIVERY"
  | "PICKUP"
  | "BTS_PICKUP"
  | "YANDEX_DELIVERY"
  | "NOOR_DELIVERY";

export type OrderStatusValue =
  | "NEW"
  | "PROGRESS"
  | "READY"
  | "ON_THE_WAY"
  | "DELIVERED"
  | "COMPLETED"
  | "CANCEL"
  | "CANCELED_BY_CUSTOMER";

export type OrderStatusInfo = {
  status: OrderStatusValue;
  datetime: string;
};

export type MyOrderListItemProduct = {
  photo: string;
  name: string;
  count: number;
  id: number;
  unit: string;
  amount: number;
};

export type MyOrderListItem = {
  id: number;
  amount: number;
  created_at: string;
  status: OrderStatusInfo;
  items: MyOrderListItemProduct[];
  service_type: ServiceTypeValue;
  address: string;
  // Confirmed as a plain string on the LIST item (real live response) — the
  // object shape ({id,name,address}) only applies to OrderDetail.branch
  // below, not here.
  branch: string;
  is_paid: boolean;
};

export type MyOrdersListResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: MyOrderListItem[];
};

// UNCONFIRMED field names — the reference only confirms OrderDetail carries
// an `items[]` array, not its exact per-item shape. Modeled defensively
// after MyOrderListItemProduct (the one confirmed items[] shape in this
// project) with every field optional, so a real shape mismatch degrades the
// UI gracefully instead of crashing. Verify against a real authenticated
// `webapp/order/{id}/detail` response before treating this as final.
export type OrderDetailItem = Partial<MyOrderListItemProduct>;

export type OrderDetail = {
  delivery?: string;
  id: number;
  items: OrderDetailItem[];
  amount: string;
  address: string | null;
  branch: { id: number; name: string; address: string };
  service_type: ServiceTypeValue;
  payment_type: string;
  status: OrderStatusInfo;
  // Shape per the order-page spec — not yet verified against a live order
  // detail response, so read it defensively.
  promo_code: {
    id: number;
    percent: number | null;
    amount: number | null;
    type: string;
  } | null;
  discount_amount: null | number;
  delivery_price: string;
  is_paid: boolean;
};
