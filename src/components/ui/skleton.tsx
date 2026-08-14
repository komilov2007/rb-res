export const LogoSkeleton = () => {
  return <div className="h-10 w-[120px] animate-pulse rounded-lg bg-gray10" />;
};

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

export const ProductsSkeleton = () => {
  return (
    <div className="flex w-full items-center justify-center rounded-[18px] bg-white px-4 py-3">
      <div className="flex w-full max-w-7xl flex-col gap-8">
        <div>
          <div className="mb-5 h-7 w-56 animate-pulse rounded-full bg-gray10" />
          <ul className="grid grid-cols-2 gap-3 lg:grid-cols-5 lg:gap-4">
            {Array.from({ length: 10 }).map((_, index) => (
              <li key={index}>
                <article className="min-h-[248px] overflow-hidden rounded-3xl bg-white shadow-[0_3px_14px_var(--black40)] lg:min-h-[280px]">
                  <div className="relative flex h-[150px] items-center justify-center overflow-hidden rounded-3xl bg-gray10 lg:h-[187px]">
                    <div className="flex h-[112px] w-[112px] animate-pulse items-center justify-center rounded-full bg-white lg:h-[132px] lg:w-[132px]">
                      <div className="h-[78px] w-[78px] rounded-full bg-yellow10 lg:h-[92px] lg:w-[92px]" />
                    </div>
                    <div className="absolute left-8 top-8 h-5 w-14 animate-pulse rounded-full bg-yellow10" />
                    <div className="absolute bottom-9 right-14 h-4 w-20 animate-pulse rounded-full bg-white" />
                    <div className="absolute bottom-3 right-3 h-8 w-8 rounded-full bg-white" />
                  </div>

                  <div className="px-4 pb-6 pt-3">
                    <div className="h-4 w-24 animate-pulse rounded-full bg-gray10" />
                    <div className="mt-3 h-3 w-full animate-pulse rounded-full bg-gray10" />
                    <div className="mt-2 h-3 w-2/3 animate-pulse rounded-full bg-gray10" />
                    <div className="mt-4 h-3 w-12 animate-pulse rounded-full bg-gray10" />
                  </div>
                </article>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
