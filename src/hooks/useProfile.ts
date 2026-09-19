"use client";

import { useEffect } from "react";
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

  useEffect(() => {
    if (!query.data?.data) return;

    console.log("profile data", query.data.data);
  }, [query.data?.data]);

  return query;
};
