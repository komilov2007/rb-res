import { request } from "@/configs/requests";
import type { ChatFileProps, ChatListResponse } from "@/types/chat";

export type GetChatListParams = {
  limit: number;
  offset: number;
};

export const getChatList = async (
  customer: number | string,
  params: GetChatListParams,
) => {
  return await request<ChatListResponse>(`webapp/chat/list/${customer}`, {
    params,
  });
};

export type SendChatFilePayload = {
  file: File;
  message?: string;
  platform: "TELEGRAM";
  customer: string;
  is_bot: "false";
  shop: string;
};

export type SendChatFileResponse = {
  file: ChatFileProps;
};

// Step 1 of sending a file: upload it over REST. Step 2 (announcing it to
// the conversation) happens separately over the socket once this resolves.
export const sendChatFile = async (data: SendChatFilePayload) => {
  const formData = new FormData();

  formData.append("file", data.file);
  if (data.message) formData.append("message", data.message);
  formData.append("platform", data.platform);
  formData.append("customer", data.customer);
  formData.append("is_bot", data.is_bot);
  formData.append("shop", data.shop);

  return await request.post<SendChatFileResponse>("chat/send/file", formData);
};
