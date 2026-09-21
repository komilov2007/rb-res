import axios from "axios";

import { clearUser, getUser, setUser } from "@/utils/user";
import type { AuthProps } from "@/types/auth";
import { isServer } from "@/utils/is-server";

const baseURL = process.env.NEXT_PUBLIC_API_URL;

export const refreshToken = async (shopId?: string | null) => {
  if (isServer() || !shopId) return;

  const user = getUser(shopId);

  if (!user?.refresh) return;

  try {
    const response = await axios.post<Partial<AuthProps>>(
      "webapp/user/auth/login/refresh",
      { refresh: user.refresh },
      { baseURL },
    );

    setUser(shopId, { ...user, ...response.data });

    return response;
  } catch (error) {
    clearUser(shopId);

    return await Promise.reject(error);
  }
};
