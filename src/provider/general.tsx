"use client";

import { useGeneral } from "@/hooks/useGeneral";
import type { ReactNode } from "react";

export const GeneralProvider = ({ children }: { children: ReactNode }) => {
  useGeneral();

  return children;
};
