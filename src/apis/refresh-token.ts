import axios, { type AxiosResponse } from "axios";

import { clearUser, getUser, setUser } from "@/utils/user";
import type { AuthProps } from "@/types/auth";
import { isServer } from "@/utils/is-server";

const baseURL = process.env.NEXT_PUBLIC_API_URL;

type RefreshResponse = AxiosResponse<Partial<AuthProps>> | undefined;

// One in-flight refresh per shop: parallel requests that all find an expired
// access token share it instead of each sending the same refresh token.
const pendingRefresh = new Map<string, Promise<RefreshResponse>>();

const requestRefresh = async (shopId: string): Promise<RefreshResponse> => {
  const user = getUser(shopId);

  if (!user?.refresh) return;

  try {
    const response = await axios.post<Partial<AuthProps>>(
      "webapp/user/auth/login/refresh",
      { refresh: user.refresh },
      { baseURL },
    );

    setUser(shopId, { ...user.auth, ...response.data });

    return response;
  } catch (error) {
    clearUser(shopId);

    return await Promise.reject(error);
  }
};

export const refreshToken = async (shopId?: string | null) => {
  if (isServer() || !shopId) return;

  const pending = pendingRefresh.get(shopId);

  if (pending) return await pending;

  const refresh = requestRefresh(shopId).finally(() => {
    pendingRefresh.delete(shopId);
  });

  pendingRefresh.set(shopId, refresh);

  return await refresh;
};
