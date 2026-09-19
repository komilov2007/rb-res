import type { AuthProps } from "@/types/auth";

const getAuthKey = (shopId: string) => `auth_${shopId}`;

type TokenProps = {
  exp: number;
};

export type UserProps = AuthProps & {
  auth: AuthProps;
  isExpiredAccess: boolean;
  isExpiredRefresh: boolean;
};

const decodeToken = (token: string) => {
  try {
    const payload = token.split(".")[1];
    const normalizedPayload = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decodedPayload = window.atob(normalizedPayload);

    return JSON.parse(decodedPayload) as TokenProps;
  } catch {
    return null;
  }
};

const isExpiredToken = (token: string) => {
  const decodedToken = decodeToken(token);

  if (!decodedToken?.exp) return true;

  return decodedToken.exp * 1000 <= Date.now();
};

export const setUser = (shopId: string, data: AuthProps) => {
  localStorage.setItem(getAuthKey(shopId), JSON.stringify({ auth: data }));
};

export const getUser = (shopId?: string | null): UserProps | undefined => {
  if (!shopId) return;

  const value = localStorage.getItem(getAuthKey(shopId));

  if (!value) return;

  try {
    const user = JSON.parse(value) as { auth: AuthProps };

    if (!user.auth?.access || !user.auth?.refresh) return;

    return {
      ...user.auth,
      auth: user.auth,
      isExpiredAccess: isExpiredToken(user.auth.access),
      isExpiredRefresh: isExpiredToken(user.auth.refresh),
    };
  } catch {
    return;
  }
};

export const clearUser = (shopId?: string | null) => {
  if (!shopId) return;

  localStorage.removeItem(getAuthKey(shopId));
};


