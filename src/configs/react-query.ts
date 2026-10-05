import { QueryClient, isServer } from "@tanstack/react-query";

const makeQueryClient = () => new QueryClient();

let browserQueryClient: QueryClient | undefined;

export const getQueryClient = () => {
  if (isServer) return makeQueryClient();

  if (!browserQueryClient) browserQueryClient = makeQueryClient();

  return browserQueryClient;
};
