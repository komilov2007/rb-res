import { ReadonlyURLSearchParams } from "next/navigation";

type QueryValue = [string, string | null | undefined];

export const createQueryString = (
  values: QueryValue[],
  searchParams: ReadonlyURLSearchParams,
) => {
  const params = new URLSearchParams(searchParams.toString());

  values.forEach(([key, value]) => {
    if (value) {
      params.set(key, value);
      return;
    }

    params.delete(key);
  });

  return params.toString();
};

export const getSearchUrl = ({
  pathname,
  search,
  searchParams,
}: {
  pathname: string;
  search: string;
  searchParams: ReadonlyURLSearchParams;
}) => {
  const query = createQueryString([["search", search]], searchParams);

  return query ? `${pathname}?${query}` : pathname;
};

export const hasSearchValue = (search: string) => {
  return search.trim().length > 0;
};
