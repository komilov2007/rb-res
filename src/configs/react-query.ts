import { QueryClient, isServer } from "@tanstack/react-query";

// Same shape as rb-shop's configs/react-query.ts. Default options are left
// as TanStack's defaults on purpose — every query already sets its own
// staleTime/retry where it needs one. Request errors are toasted once by the
// shared request interceptor (configs/requests.ts), so no QueryCache onError.
const makeQueryClient = () => new QueryClient();

let browserQueryClient: QueryClient | undefined;

// Server: a fresh client per render, so one request's cache never leaks into
// another's. Browser: one client for the app's lifetime.
export const getQueryClient = () => {
  if (isServer) return makeQueryClient();

  if (!browserQueryClient) browserQueryClient = makeQueryClient();

  return browserQueryClient;
};
