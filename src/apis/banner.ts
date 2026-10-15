import { request } from "@/configs/requests";
import type { BannerParams, BannerProps } from "@/types/banner";

export const getBanners = async (shopId: string, params?: BannerParams) => {
  return await request<BannerProps[]>(`webapp/banner/list/${shopId}`, {
    params,
  });
};
