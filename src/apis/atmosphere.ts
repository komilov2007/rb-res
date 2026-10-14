import { request } from "@/configs/requests";
import type { AtmosphereProps } from "@/types/atmosphere";

export const getAtmosphere = async (shopId: string) => {
  return await request<AtmosphereProps>(`webapp/atmosphere/${shopId}`, {
    skipErrorToast: true,
  });
};
