import { request } from "@/configs/requests";
import { BannerProps } from "@/types/banner";

export const getBanners = async (shopId: string) => {
  return await request<BannerProps[]>(`webapp/banner/list/${shopId}`);
};
