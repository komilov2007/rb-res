import { refreshToken } from "@/apis/refresh-token";
import { clearUser, getUser } from "@/utils/user";
import { useAuthStore } from "@/stores/auth";
import { getApiErrorMessage } from "@/utils/api-error";
import { getLanguage, isServer } from "@/utils/is-server";
import axios, { type AxiosError, type AxiosHeaders } from "axios";
import { toast } from "sonner";

const baseURL = process.env.NEXT_PUBLIC_API_URL;

const publicEndpoints = [
  "webapp/general/",
  "webapp/banner/list/",
  "webapp/category/list/",
  "webapp/product/list/",
  "webapp/product/",
  "webapp/branch/list/",
  "webapp/branch/",
];

const isPublicEndpoint = (url?: string) => {
  if (!url) return false;

  return publicEndpoints.some((endpoint) => url.startsWith(endpoint));
};

const getShopId = () => {
  if (isServer()) return;

  return new URLSearchParams(window.location.search).get("shop_id");
};

const logoutByInvalidToken = () => {
  const shopId = getShopId();

  clearUser(shopId);
  useAuthStore.getState().logout();
};

export const request = axios.create({
  baseURL,
});

request.interceptors.request.use(async (config) => {
  if (!isServer()) {
    const headers = config.headers as AxiosHeaders;
    const shopId = getShopId();
    const user = getUser(shopId);

    if (!headers.has("Accept-Language")) {
      headers.set("Accept-Language", getLanguage());
    }

    if (user?.access && !isPublicEndpoint(config.url)) {
      if (user.isExpiredRefresh) {
        logoutByInvalidToken();
        return config;
      }

      if (!user.isExpiredAccess) {
        headers.set("Authorization", `Bearer ${user.access}`);
        return config;
      }

      try {
        await refreshToken(shopId);
      } catch {
        logoutByInvalidToken();
        return config;
      }

      const updatedUser = getUser(shopId);

      if (updatedUser?.access) {
        headers.set("Authorization", `Bearer ${updatedUser.access}`);
        // Keep the store in step with storage, so code that writes the
        // session back from the store (e.g. a name change) never restores
        // the tokens this refresh just replaced.
        useAuthStore.getState().setAuth(updatedUser.auth);
      }
    }
  }

  return config;
});

declare module "axios" {
  interface AxiosRequestConfig {
    skipErrorToast?: boolean;
  }
}

request.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (!isServer()) {
      if (error?.response?.status === 401) {
        logoutByInvalidToken();
      }

      // Single place every failed request (any status, any domain — payment,
      // order, login, ...) surfaces to the user, so individual callers don't
      // each need their own .catch()/toast. A fixed id means a repeated or
      // retried failure updates the same toast in place instead of stacking
      // duplicates.
      // skipErrorToast: for requests whose error is already shown inline by
      // the caller (e.g. the promo code field).
      if (!axios.isCancel(error) && !error.config?.skipErrorToast) {
        toast.error(getApiErrorMessage(error), { id: "global-api-error" });
      }
    }

    return await Promise.reject(error);
  },
);

