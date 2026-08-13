export type ProductCategoryProps = {
  id: number;
  name: string;
};

export type ProductProps = {
  id: number;
  name: string;
  price: number;
  photo: string;
  photo1: string;
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

export type ProductsResponseProps = {
  count: number;
  next: string | null;
  previous: string | null;
  results: ProductProps[];
};

export type CardProductProps = {
  product: ProductProps;
  variant?: "default" | "discount";
};
