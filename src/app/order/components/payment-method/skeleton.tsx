// Same grid and card height as the real payment cards (payment-grid.tsx),
// each card one solid shimmering block, so nothing jumps when they load.
const PaymentMethodSkeleton = () => (
  <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-2 lg:grid-cols-3">
    {Array.from({ length: 6 }).map((_, index) => (
      <div key={index} className="skeleton h-21.5 rounded-xl" />
    ))}
  </div>
);

export default PaymentMethodSkeleton;
