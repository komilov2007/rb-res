import type { ProductProps } from "@/types/product";
import type { CategoriesProps } from "@/types/categories";

export const hasDiscount = (product: ProductProps) => {
  return Boolean(product.discount_price || product.sale_amount);
};

export const groupProductsByCategory = (products: ProductProps[]) => {
  const groups = new Map<
    string,
    { id: string; name: string; products: ProductProps[] }
  >();

  products.forEach((product) => {
    if (!product.category) return;

    const id = String(product.category.id);
    const group = groups.get(id);

    if (group) {
      group.products.push(product);
      return;
    }

    groups.set(id, {
      id,
      name: product.category.name,
      products: [product],
    });
  });

  return Array.from(groups.values());
};

export const sortProductGroupsByCategories = (
  groups: ReturnType<typeof groupProductsByCategory>,
  categories: CategoriesProps[],
) => {
  const order = new Map(
    categories.map((category, index) => [category.id, index]),
  );

  return [...groups].sort((first, second) => {
    const firstOrder = order.get(Number(first.id)) ?? Number.MAX_SAFE_INTEGER;
    const secondOrder = order.get(Number(second.id)) ?? Number.MAX_SAFE_INTEGER;

    return firstOrder - secondOrder;
  });
};
