// Mirrors OrderDetailCard's own section-by-section layout (id+badge,
// address, date, name, phone, item row, price row, button) rather than the
// old simple thumbnail+lines shape, so the loading state doesn't visibly
// jump in structure once real cards replace it. Each bar sits in a box of
// the real text's line height, and the card keeps the real card's padding
// and border width (border transparent — no borders on skeletons).
const SkeletonField = ({
  labelWidth,
  valueWidth,
}: {
  labelWidth: string;
  valueWidth: string;
}) => (
  <div>
    <div className="flex h-4 items-center">
      <div className={`skeleton h-3 rounded-full ${labelWidth}`} />
    </div>
    <div className="mt-0.5 flex h-5 items-center">
      <div className={`skeleton h-3.5 rounded-full ${valueWidth}`} />
    </div>
  </div>
);

const OrderCardSkeleton = () => (
  <div className="flex flex-col gap-3 rounded-2xl border border-transparent bg-white p-4">
    <div className="flex h-5 items-center justify-between gap-2">
      <div className="skeleton h-4 w-20 rounded-full" />
      <div className="skeleton h-5 w-16 rounded-full" />
    </div>
    <SkeletonField labelWidth="w-24" valueWidth="w-full" />
    <SkeletonField labelWidth="w-32" valueWidth="w-28" />
    <SkeletonField labelWidth="w-24" valueWidth="w-32" />
    <SkeletonField labelWidth="w-24" valueWidth="w-28" />
    <div className="flex h-4 items-center border-t border-transparent pt-3 box-content">
      <div className="skeleton h-3.5 w-28 rounded-full" />
    </div>
    <div className="flex h-5 items-center justify-between border-t border-transparent pt-3 box-content">
      <div className="skeleton h-3 w-20 rounded-full" />
      <div className="skeleton h-3.5 w-24 rounded-full" />
    </div>
    <div className="skeleton h-11 w-full rounded-xl" />
  </div>
);

export default OrderCardSkeleton;
