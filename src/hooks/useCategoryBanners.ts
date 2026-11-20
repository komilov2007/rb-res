"use client";

import { useShopCategories } from "@/hooks/useShopCategories";
import { normalizeCategories } from "@/utils/product";

// Vaqtincha statik: kategoriya bannerlari uchun alohida API ulanmaguncha
// public/ ichidagi rasmlar kategoriyalar tartibi bo'yicha (1, 2, 3) beriladi.
const STATIC_CATEGORY_BANNERS = ["/1.jpg", "/2.jpg", "/3.jpg"];

export const useCategoryBanners = () => {
  const { data } = useShopCategories();
  const categories = normalizeCategories(data?.data);

  const getCategoryBanner = (categoryId: number | string) => {
    const index = categories.findIndex(
      (category) => String(category.id) === String(categoryId),
    );

    return index >= 0 ? STATIC_CATEGORY_BANNERS[index] : undefined;
  };

  return { getCategoryBanner };
};
