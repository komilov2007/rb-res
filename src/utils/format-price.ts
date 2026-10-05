export const formatPrice = (price: number) => {
  return new Intl.NumberFormat("uz-UZ", { maximumFractionDigits: 0 }).format(
    price,
  );
};
