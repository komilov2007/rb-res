import { request } from "@/configs/requests";
import { getUser } from "@/lib/user";
import type { UserInfo } from "@/types/profile";
import { isServer } from "@/utils/is-server";

const getShopId = () => {
  if (isServer()) return;

  return new URLSearchParams(window.location.search).get("shop_id");
};

export const getMe = async () => {
  const user = getUser(getShopId());
  const customer = user?.customer;

  if (!customer) {
    throw new Error("Customer id not found");
  }

  return await request<UserInfo>(`webapp/user/profile/${customer}`);
};
