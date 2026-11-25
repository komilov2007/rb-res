import { request } from "@/configs/requests";
import type { OfertaProps } from "@/types/oferta";

export const getOferta = async (shopId: string) => {
  return await request<OfertaProps>(`robomarket/click/superapp/${shopId}`);
};

export const updateOferta = async (shopId: string) => {
  return await request.post(`click/update/oferta/${shopId}`);
};
