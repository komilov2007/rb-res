"use client";

import { QueryClientProvider } from "@tanstack/react-query";

import { getQueryClient } from "@/configs/react-query";
import type { ChildrenProps } from "@/types/children";

export const ReactQuery = ({ children }: ChildrenProps) => {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};
