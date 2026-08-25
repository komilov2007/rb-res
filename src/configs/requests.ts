import { getLanguage, isServer } from "@/utils/is-server";
import { getAccessToken } from "@/lib/user";
import axios, { AxiosHeaders } from "axios";

const baseURL = process.env.NEXT_PUBLIC_API_URL;

export const request = axios.create({
  baseURL,
});

request.interceptors.request.use((config) => {
  if (!isServer()) {
    const headers = config.headers as AxiosHeaders;
    const shopId = new URLSearchParams(window.location.search).get("shop_id");
    const access = getAccessToken(shopId);

    headers.set("Accept-Language", getLanguage());

    if (access) {
      headers.set("Authorization", `Bearer ${access}`);
    }
  }

  return config;
});
