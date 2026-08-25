export type CategoriesProps = {
  id: number;
  name: string;
  photo: string;
  is_active: boolean;
  products_count: number;
  scroll_type: string;
};

export type CategoriesResponseProps =
  | CategoriesProps[]
  | {
      results: CategoriesProps[];
    };
