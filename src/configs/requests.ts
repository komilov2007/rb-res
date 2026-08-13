import { getLanguage, isServer } from "@/utils/is-server";
import axios, { AxiosHeaders } from "axios";

const baseURL = process.env.NEXT_PUBLIC_API_URL;

export const request = axios.create({
  baseURL,
});

request.interceptors.request.use((config) => {
  if (!isServer()) {
    (config.headers as AxiosHeaders).set("Accept-Language", getLanguage());
  }
  return config;
});
