import type { ProductProps } from "./product";

export type CartItemProps = {
  product: ProductProps;
  quantity: number;
};

export type CartViewProps = {
  isMobile: boolean;
};
