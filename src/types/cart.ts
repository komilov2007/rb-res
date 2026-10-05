import type { ProductProps, ProductSkuProps } from "./product";

export type CartSelectedSkuProps = Pick<ProductSkuProps, "name" | "status" | "amount">;

export type CartItemProps = {
  id?: number;
  product: ProductProps;
  quantity: number;
  parameter?: ProductSkuProps | CartSelectedSkuProps | null;
  ad_parameter?: (ProductSkuProps | CartSelectedSkuProps)[];
  is_active?: boolean;
};

export type ApiCartItemProps = {
  id: number;
  product: Partial<ProductProps> &
    Pick<ProductProps, "id" | "name" | "photo" | "status" | "amount">;
  quantity: number;
  amount: number;
  is_active: boolean;
  count: number;
  parameter: CartSelectedSkuProps | null;
  ad_parameter: CartSelectedSkuProps[];
};

export type CartViewProps = {
  isMobile: boolean;
};
