"use client";

import { useState } from "react";

import type { UnavailableState } from "./constants";

// Cart lines createOrder reported unavailable for a service/branch, and the
// modal that explains it.
export const useUnavailableItems = () => {
  const [unavailable, setUnavailable] = useState<UnavailableState | null>(
    null,
  );
  const [isUnavailableModalOpen, setIsUnavailableModalOpen] = useState(false);

  return {
    unavailable,
    setUnavailable,
    isUnavailableModalOpen,
    openUnavailableModal: () => setIsUnavailableModalOpen(true),
    closeUnavailableModal: () => setIsUnavailableModalOpen(false),
  };
};
