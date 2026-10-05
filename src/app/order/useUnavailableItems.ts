"use client";

import { useState } from "react";

import type { UnavailableState } from "./constants";

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
