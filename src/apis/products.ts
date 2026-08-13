import { request } from "@/configs/requests";
import type { ProductsResponseProps } from "@/types/product";
interface GetProductsParams {
  search?: string;
  limit?: number;
  offset?: number;
}

export const getProducts = async (shopId: string, params?: GetProductsParams) => {
  return await request<ProductsResponseProps>(
    `webapp/product/list/${shopId}`,
    {
      params: {
        limit: params?.limit ?? 10,
        offset: params?.offset,
        search: params?.search || undefined,
      },
    },
  );
};
