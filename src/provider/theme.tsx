"use client";

import { useEffect } from "react";

import { getPrimaryColorValue } from "@/constants/theme";
import { useThemeStore } from "@/stores/theme";

// Writes the picked primary colour onto <html> as --primary. globals.css
// derives --primary10 from it, so every primary utility follows. Renders
// nothing — mounted once in the app provider.
export const ThemeSync = () => {
  const primaryColor = useThemeStore((state) => state.primaryColor);

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--primary",
      getPrimaryColorValue(primaryColor),
    );
  }, [primaryColor]);

  return null;
};
