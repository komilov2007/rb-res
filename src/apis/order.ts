import { request } from "@/configs/requests";
import type {
  MyOrdersListResponse,
  OrderDetail,
  PaymentTypeProps,
} from "@/types/order";

export type DeliveryCalculationParams = {
  service_type?: string;
  latitude?: number;
  longitude?: number;
  total_amount: number;
};

export type DeliveryCalculationResponse = {
  delivery_type: string;
  delivery: number | string;
};

export const getDeliveryCalculation = async (
  customerId: number,
  shopId: string,
  params: DeliveryCalculationParams,
) => {
  return await request<DeliveryCalculationResponse>(
    `webapp/calculate/delivery/${customerId}/${shopId}`,
    { params },
  );
};

export type CreateOrderAddress = {
  address: number;
  room: number | null;
  floor: number | null;
  entrance: number | null;
  comment: string | null;
};

export type CreateOrderPayload = {
  spend_cashback: boolean | null;
  near_branch: number | null;
  shop: string;
  customer: number;
  platform: "TELEGRAM";
  branch: number | null;
  address?: CreateOrderAddress;
  payment_type: string;
  service_type: string;
  is_paid: false;
  promo_code?: number;
  items: number[];
  shipping_datetime: string | null;
  is_menu_button: boolean;
};

export type CreateOrderResponse = {
  order: number;
  status: string;
  service_type: string;
  url?: {
    url: string | null;
    order_id: number;
    external_id?: string | null;
  };
  available_products?: number[] | null;
  unavailable_products?: number[] | null;
};

export const createOrder = async (data: CreateOrderPayload) => {
  return await request.post<CreateOrderResponse>("webapp/order/create", data);
};

export type OrderStatusResponse = {
  status: string;
};

export const getOrderStatus = async (
  orderId: string | number,
  externalId: string,
) => {
  return await request<OrderStatusResponse>(
    `webapp/check/state/${orderId}/${externalId}`,
  );
};

export type PaymentListItem = {
  id: number;
  is_available: boolean;
  slug: "payme" | "click" | "no-token" | "unversal";
  state: PaymentTypeProps;
  data: {
    id: number;
    is_active: boolean;
    updated_at: string;
    params: { token: string };
  } | null;
};

export const getPaymentList = async (shopId: string, deliveryType: string) => {
  return await request<PaymentListItem[]>(`webapp/payment/list/${shopId}`, {
    params: { delivery_type: deliveryType },
  });
};

export type PromoCodeResponse = {
  id: number;
  type: "PERCENT" | "AMOUNT";
  discount: number;
  total_amount: number;
  promo_code: string;
};

export const getPromoCode = async (
  shopId: string,
  customerId: number,
  promoCode: string,
) => {
  return await request<PromoCodeResponse>(
    `webapp/promo-code/${shopId}/${customerId}`,
    {
      params: { promo_code: promoCode.toUpperCase() },
      skipErrorToast: true,
    },
  );
};

export type PaymentTokenResponse = {
  bot_token: string;
  payment: { token: string };
};

export const getPaymentToken = async (
  shopId: string,
  paymentType: "CLICK" | "PAYME",
) => {
  return await request<PaymentTokenResponse>(
    `webapp/payment/${shopId}/${paymentType}`,
  );
};

export type MyOrdersParams = {
  limit: number;
  offset: number;
  is_active?: boolean;
};

export const getMyOrders = async (
  customerId: number,
  params: MyOrdersParams,
) => {
  return await request<MyOrdersListResponse>(
    `webapp/user/my-orders/${customerId}`,
    { params },
  );
};

export const getOrderDetail = async (orderId: number | string) => {
  return await request<OrderDetail>(`webapp/order/${orderId}/detail`);
};

export const cancelOrder = async (
  orderId: number | string,
  shopId: string,
) => {
  return await request.post<unknown>(`webapp/order/cancel/${orderId}/${shopId}`);
};

export type ProceedToPaymentResponse = {
  id: number;
  url: string;
  order_id: string;
};

export const proceedToPayment = async (orderId: number | string) => {
  return await request<ProceedToPaymentResponse>(
    `webapp/order/${orderId}/payment`,
  );
};
