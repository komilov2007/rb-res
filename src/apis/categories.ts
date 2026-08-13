import { request } from "@/configs/requests";
import { CategoriesProps } from "@/types/categories";

export const getCategories = async (shopId: string) => {
  return await request<CategoriesProps[]>(`webapp/category/list/${shopId}`);
};
