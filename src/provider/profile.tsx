"use client";

import type { ReactNode } from "react";

import { useProfile } from "@/hooks/useProfile";

export const ProfileProvider = ({ children }: { children: ReactNode }) => {
  useProfile();

  return children;
};
