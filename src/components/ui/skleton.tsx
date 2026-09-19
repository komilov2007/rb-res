import { CARD_HEIGHT_CLASS } from "@/components/card-product/utils";

export const BannerSkeleton = () => {
  return (
    <section className="flex w-full items-center justify-center px-4 pb-4">
      <div className="w-full max-w-7xl">
        <div className="h-[150px] animate-pulse rounded-xl bg-gray10 sm:h-[190px] lg:h-[300px]" />
      </div>
    </section>
  );
};

export const CategoriesSkeleton = () => {
  return (
    <section className="mt-3 flex w-full items-center justify-center rounded-b-[20px] bg-white px-4 pb-4 pt-3 lg:mt-0 lg:rounded-b-none lg:pt-3">
      <div className="w-full max-w-7xl">
        <ul className="flex items-center gap-2 overflow-hidden pb-1 lg:items-start lg:gap-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <li
              key={index}
              className="flex min-w-max items-center lg:min-w-[112px] lg:flex-col lg:gap-2"
            >
              <span className="hidden h-[100px] w-[112px] animate-pulse rounded-2xl bg-gray10 lg:block" />
              <span className="h-9 w-24 animate-pulse rounded-full bg-gray10 lg:h-3 lg:w-20" />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

// Same shape as a categories-page tile: square image block with the name
// line placeholder at its bottom. White on the page's gray background (a
// gray tile would disappear into it).
export const CategoryTileSkeleton = () => {
  return (
    <div className="relative flex aspect-square w-full animate-pulse items-end overflow-hidden rounded-xl bg-white p-2">
      <div className="mx-auto h-3 w-2/3 rounded-full bg-gray10" />
    </div>
  );
};

// Same box as CardProduct: its fixed card height, the 170/240px image block,
// price + name lines, and the full-width "Savatga" button at the bottom.
export const ProductCardSkeleton = () => {
  return (
    <article
      className={`flex ${CARD_HEIGHT_CLASS} w-full animate-pulse flex-col overflow-hidden rounded-[18px] bg-white ring-1 ring-black/5 lg:rounded-[20px]`}
    >
      <div className="h-[170px] shrink-0 rounded-[18px] bg-gray10 lg:h-[240px] lg:rounded-[20px]" />
      <div className="flex min-h-0 flex-1 flex-col px-4 pb-4 pt-4">
        <div className="h-4 w-20 rounded-full bg-gray10" />
        <div className="mt-2 h-3 w-full rounded-full bg-gray10" />
        <div className="mt-1.5 h-3 w-2/3 rounded-full bg-gray10" />
        <div className="mt-auto h-9 w-full rounded-xl bg-gray10" />
      </div>
    </article>
  );
};

export const ProductsSkeleton = () => {
  return (
    <div className="flex w-full items-center justify-center rounded-[18px] bg-white px-4 py-3">
      <div className="flex w-full max-w-7xl flex-col gap-8">
        <div>
          <div className="mb-5 h-7 w-56 animate-pulse rounded-full bg-gray10" />
          <ul className="grid grid-cols-2 gap-3 lg:grid-cols-5 lg:gap-4">
            {Array.from({ length: 10 }).map((_, index) => (
              <li key={index}>
                <ProductCardSkeleton />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export const ProductDetailSkeleton = () => {
  return (
    <div className="animate-pulse">
      <div className="h-[250px] rounded-[24px] bg-gray10" />
      <div className="px-5 pt-4">
        <div className="h-6 w-24 rounded-lg bg-gray10" />
        <div className="mt-3 flex items-start justify-between gap-4">
          <div className="h-12 min-w-0 flex-1 rounded-lg bg-gray10" />
          <div className="h-8 w-16 shrink-0 rounded-full bg-gray10" />
        </div>
        <div className="mt-3 space-y-2">
          <div className="h-3 w-full rounded-full bg-gray10" />
          <div className="h-3 w-4/5 rounded-full bg-gray10" />
        </div>
        <div className="mt-5 flex items-center justify-between gap-4 rounded-[22px] bg-gray10 px-4 py-4">
          <div className="h-7 w-28 rounded-lg bg-white" />
          <div className="h-10 w-[132px] rounded-xl bg-white" />
        </div>
      </div>
    </div>
  );
};
