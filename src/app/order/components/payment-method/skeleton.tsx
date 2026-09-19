// Matches the real grid's shape (grid-cols-2, rounded-2xl bordered cards)
// and STEP 8's original branch-list skeleton treatment
// (animate-pulse + bg-gray10/50), so the transition reads as "loading new
// options" whether it's the very first render or a deliveryType change.
const PaymentMethodSkeleton = () => (
  <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2">
    {Array.from({ length: 6 }).map((_, index) => (
      <div
        key={index}
        className="flex flex-col gap-2 rounded-2xl border border-gray180 p-3"
      >
        <div className="h-8 w-8 animate-pulse rounded-lg bg-gray10/50" />
        <div className="h-3 w-3/4 animate-pulse rounded-full bg-gray10/50" />
      </div>
    ))}
  </div>
);

export default PaymentMethodSkeleton;
