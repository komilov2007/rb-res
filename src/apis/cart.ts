import { request } from "@/configs/requests";

export type CartListResponse =
  | unknown[]
  | {
      results?: unknown[];
      data?: unknown[];
    };

type BranchPayload = {
  branch_id?: string;
};

export type UpdateCartResponse = {
  quantity: number;
  available_amount: number;
};

export type PostCartPayload = BranchPayload & {
  product: number;
  quantity: number;
  parameter?: number;
  ad_parameter?: number[];
};

export type PostCartListPayload = {
  product: number;
  quantity: number;
  parameter: number | null;
  ad_parameter: number[];
};

export const getCartList = async (customerId: number | string) => {
  return await request<CartListResponse>(`webapp/card/list/${customerId}`);
};

export const postCart = async (
  customerId: number | string,
  data: PostCartPayload,
) => {
  return await request.post<unknown>(`webapp/card/add/${customerId}`, data);
};

export const postCartProductList = async (
  customerId: number | string,
  data: PostCartListPayload[],
) => {
  return await request.post<unknown>(`webapp/card/add/all/${customerId}`, data);
};

export const addNoParameterCart = async (
  customerId: number | string,
  productId: number,
  quantity: number,
  data: BranchPayload,
) => {
  return await request.post<UpdateCartResponse>(
    `webapp/stock/${customerId}/${productId}/${quantity}`,
    data,
  );
};

export const updateCartItem = async (
  id: number,
  quantity: number,
  data: BranchPayload,
) => {
  return await request.post<UpdateCartResponse>(
    `webapp/card/update/${id}/${quantity}`,
    data,
  );
};

export const removeCartItem = async (id: number) => {
  return await request.post<unknown>(`webapp/card/remove/${id}`);
};

export const clearCartList = async (customerId: number | string) => {
  return await request.post<unknown>(`webapp/card/clear/all/${customerId}`);
};

export type UpdateCartStatusPayload = {
  items: number[];
};

export type UpdateCartStatusResponse = {
  is_open?: boolean;
};

export const updateCartStatus = async (
  customerId: number | string,
  shopId: string,
  data: UpdateCartStatusPayload,
) => {
  return await request.post<UpdateCartStatusResponse>(
    `webapp/card/status/update/${customerId}/${shopId}`,
    data,
  );
};
