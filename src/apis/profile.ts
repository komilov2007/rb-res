import { request } from "@/configs/requests";
import { getUser } from "@/utils/user";
import type { UserInfo } from "@/types/profile";
import { getShopIdFromUrl } from "@/utils/is-server";

export const getMe = async () => {
  const user = getUser(getShopIdFromUrl());
  const customer = user?.customer;

  if (!customer) {
    throw new Error("Customer id not found");
  }

  return await request<UserInfo>(`webapp/user/profile/${customer}`);
};
