"use client";

import { useEffect } from "react";

import { CLICK_PRIMARY_COLOR, getPrimaryColorValue } from "@/constants/theme";
import { useThemeStore } from "@/stores/theme";
import { isClick } from "@/utils/click";

// Writes the picked primary colour onto <html> as --primary. globals.css
// derives --primary10 from it, so every primary utility follows. Renders
// nothing — mounted once in the app provider.
//
// Inside the Click superapp the picked colour is ignored and Click's brand
// blue is pinned instead. rb-shop does this with a `:root` <style> block,
// but here the colour is set as an inline style on <html> (which always
// beats a stylesheet rule), so the override has to go through the same
// channel to take effect.
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
