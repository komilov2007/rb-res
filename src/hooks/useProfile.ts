"use client";

import { useQuery } from "@tanstack/react-query";

import { getMe } from "@/apis/profile";
import { useAuthStore } from "@/stores/auth";
import { REACT_QUERY_KEYS } from "@/constants/react-query-keys";

export const useProfile = () => {
  const hasAccess = useAuthStore((state) => state.hasAccess);
  const customerId = useAuthStore((state) => state.auth?.customer);

  // Keyed by customer: after logout + login as someone else the previous
  // user's cached profile must not be shown (or prefill the order form).
  const query = useQuery({
    enabled: hasAccess,
    queryKey: [REACT_QUERY_KEYS.PROFILE, customerId],
    queryFn: getMe,
  });

  return query;
};
