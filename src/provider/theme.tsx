"use client";

import { useEffect } from "react";

import { CLICK_PRIMARY_COLOR } from "@/constants/theme";
import { useGeneral } from "@/hooks/useGeneral";
import { isClick } from "@/utils/click";

const isValidColor = (value?: string | null): value is string =>
  Boolean(value) && CSS.supports("color", value as string);

export const ThemeSync = () => {
  const { data } = useGeneral();
  const websiteColor = data?.data.website_color;

  useEffect(() => {
    const root = document.documentElement.style;
    const color = isClick() ? CLICK_PRIMARY_COLOR : websiteColor;

    if (isValidColor(color)) root.setProperty("--primary", color);
    else root.removeProperty("--primary");
  }, [websiteColor]);

  return null;
};
