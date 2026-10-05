"use client";

import { useEffect } from "react";

import { CLICK_PRIMARY_COLOR, getPrimaryColorValue } from "@/constants/theme";
import { useThemeStore } from "@/stores/theme";
import { isClick } from "@/utils/click";

export const ThemeSync = () => {
  const primaryColor = useThemeStore((state) => state.primaryColor);

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--primary",
      isClick() ? CLICK_PRIMARY_COLOR : getPrimaryColorValue(primaryColor),
    );
  }, [primaryColor]);

  return null;
};
