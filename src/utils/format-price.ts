// So'm has no fractional unit, so prices are shown whole (a percent
// discount gives e.g. 117.81 -> 118). Only the display is rounded; totals
// are still computed from the exact amounts.
export const formatPrice = (price: number) => {
  return new Intl.NumberFormat("uz-UZ", { maximumFractionDigits: 0 }).format(
    price,
  );
};
