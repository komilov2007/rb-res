export type ProductCategoryProps = {
  id: number;
  name: string;
};

export type ProductProps = {
  id: number;
  name: string;
  price: number;
  description?: string | null;
  photo: string | null;
  photo1: string | null;
  is_xit: boolean;
  have_parameter: boolean;
  sale_type: string | null;
  sale_amount: number | null;
  discount_price: number | null;
  status: string;
  category: ProductCategoryProps;
  amount: number;
  branches: number[];
};

export type ProductDetailPhotoProps = {
  photo: string | null;
  photo1: string | null;
};

export type ProductUnitProps = {
  id: number;
  name: string;
  unit: string;
};

export type ProductSkuProps = {
  id: number;
  name: string;
  unit: ProductUnitProps | null;
  price?: number | null;
  status: string;
  amount: number;
  ids: Record<string, unknown>;
};

export type ProductParameterProps = {
  id: number;
  name: string;
  skus: ProductSkuProps[];
  type?: string;
  ids: Record<string, unknown>;
};

export type ProductDetailProps = ProductProps & {
  shop: string;
  desc: string | null;
  photos: ProductDetailPhotoProps[];
  unit: ProductUnitProps | null;
  parameter: ProductParameterProps | null;
  additional_parameter: ProductParameterProps[];
  weekly_orders: number;
};

export type ProductsResponseProps = {
  count: number;
  next: string | null;
  previous: string | null;
  results: ProductProps[];
};

export type CardProductProps = {
  product: ProductProps;
  variant?: "default" | "discountRight2";
  saleBadgeVariant?: "primary" | "green" | "red" | "orange";
  // Not sold at the selected home branch — rendered muted and non-interactive.
  isUnavailable?: boolean;
  // Always use the white card box (non-discount cards are light gray on
  // mobile by default).
  whiteSurface?: boolean;
};

