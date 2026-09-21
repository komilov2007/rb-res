"use client";

import { useQuery } from "@tanstack/react-query";

import { getMe } from "@/apis/profile";
import { useAuthStore } from "@/stores/auth";

export const useProfile = () => {
  const hasAccess = useAuthStore((state) => state.hasAccess);

  const query = useQuery({
    enabled: hasAccess,
    queryKey: ["profile"],
    queryFn: getMe,
  });

  return query;
};
