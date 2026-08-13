import { request } from "@/configs/requests";
import type { GeneralProps } from "@/types/general";

export const getGeneral = async (shopid: string) => {
  return await request<GeneralProps>(`webapp/general/${shopid}`);
};
