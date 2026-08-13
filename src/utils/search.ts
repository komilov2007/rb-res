import { ReadonlyURLSearchParams } from "next/navigation";

export const createQueryString = (
  value: [string, string][],
  searchParams: ReadonlyURLSearchParams,
) => {
  const params = new URLSearchParams(searchParams.toString());

  value.forEach((value) => {
    if (value[1]) {
      params.set(value[0], value[1]);
      return;
    }

    params.delete(value[0]);
  });

  return params.toString();
};
