// Same box, padding and line heights as OrderCard (id + badge, date,
// location, count + price) so nothing jumps on load.
const OrderCardSkeleton = () => (
  <div className="flex items-start gap-3 rounded-2xl bg-white p-4 lg:border lg:border-gray180">
    <div className="skeleton h-14 w-14 shrink-0 rounded-xl" />
    <div className="min-w-0 flex-1">
      <div className="flex items-start justify-between gap-2">
        <div className="skeleton h-5 w-16 rounded-full" />
        <div className="skeleton h-5 w-20 rounded-full" />
      </div>
      <div className="skeleton mt-1 h-4 w-28 rounded-full" />
      <div className="skeleton mt-2 h-4 w-full rounded-full" />
      <div className="mt-2 flex items-center justify-between">
        <div className="skeleton h-4 w-16 rounded-full" />
        <div className="skeleton h-5 w-24 rounded-full" />
      </div>
    </div>
  </div>
);

export default OrderCardSkeleton;
