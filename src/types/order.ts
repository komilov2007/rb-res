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
  address: number | null;
  room: number | null;
  floor: number | null;
  entrance: number | null;
  comment: string | null;
  spend_cashback: boolean;
  promocode_id: number | null;
  promocode: string | null;
  total: number | null;
  shipping_date: string | null;
  shipping_time: string | null;
  delivery_price: number | null;
  delivery_price_type: string | null;
};

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
  branch: string;
  is_paid: boolean;
};

export type MyOrdersListResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: MyOrderListItem[];
};

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
