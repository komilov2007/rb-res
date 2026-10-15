import type { ProductProps } from "@/types/product";
import type {
  CategoriesProps,
  CategoriesResponseProps,
} from "@/types/categories";

export const hasDiscount = (product: ProductProps) => {
  return Boolean(product.discount_price || product.sale_amount);
};

export const normalizeCategories = (
  categories?: CategoriesResponseProps,
): CategoriesProps[] => {
  if (!categories) return [];
  if (Array.isArray(categories)) return categories;

  return categories.results ?? [];
};

export type ProductGroupProps = {
  key: string;
  id: string;
  name: string;
  products: ProductProps[];
};

export const groupProductPagesByCategory = (
  pages: ProductProps[][],
  categories: CategoriesProps[],
) => {
  const order = new Map(
    categories.map((category, index) => [category.id, index]),
  );
  const getOrder = (product: ProductProps) =>
    order.get(product.category.id) ?? Number.MAX_SAFE_INTEGER;
  const groups: ProductGroupProps[] = [];

  pages.forEach((page) => {
    [...page]
      .filter((product) => product.category)
      .sort((first, second) => getOrder(first) - getOrder(second))
      .forEach((product) => {
        const id = String(product.category.id);
        const lastGroup = groups.at(-1);

        if (lastGroup?.id === id) {
          lastGroup.products.push(product);
          return;
        }

        groups.push({
          key: `${id}-${groups.length}`,
          id,
          name: product.category.name,
          products: [product],
        });
      });
  });

  return groups;
};
