import { request } from "@/configs/requests";
import type { GeneralProps } from "@/types/general";

export const getGeneral = async (shopid: string) => {
  return await request<GeneralProps>(`webapp/general/${shopid}`);
};

// Reports an unrecoverable webapp error to the bot (old webapp parity).
export const postBotError = async (error: string) => {
  return await request.post("bot/error", { error }, { skipErrorToast: true });
};
