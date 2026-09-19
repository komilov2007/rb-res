import type { ProductProps, ProductSkuProps } from "./product";

// Confirmed live against GET webapp/card/list/{customer}: the server only
// ever echoes back the resolved name/status/amount for a selected sku —
// no id, unit, or price. Guest/local cart items, by contrast, store the
// full ProductSkuProps object (built client-side from the product's own
// parameter definitions at add-time, before any server round-trip). A cart
// item's parameter/ad_parameter can be either shape depending on how it
// got there.
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
