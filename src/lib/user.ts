import type { AuthProps } from "@/types/auth";

const getAuthKey = (shopId: string) => `auth_${shopId}`;

export const setUser = (shopId: string, data: AuthProps) => {
  localStorage.setItem(getAuthKey(shopId), JSON.stringify({ auth: data }));
};

export const getUser = (shopId: string) => {
  const value = localStorage.getItem(getAuthKey(shopId));

  if (!value) return null;

  try {
    return JSON.parse(value) as { auth: AuthProps };
  } catch {
    return null;
  }
};

export const getAccessToken = (shopId?: string | null) => {
  if (!shopId) return;

  return getUser(shopId)?.auth.access;
};

export const clearUser = (shopId?: string | null) => {
  if (!shopId) return;

  localStorage.removeItem(getAuthKey(shopId));
};
