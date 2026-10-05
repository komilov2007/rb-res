"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { YANDEX_LANG } from "@/constants/yandex";
import type { BranchProps } from "@/types/branch";
import type { Coordinates } from "@/types/yandex";
import { requestYandexGeocode } from "@/utils/yandex";
import { REACT_QUERY_KEYS } from "@/constants/react-query-keys";

export const useCustomerPoint = (
  open: boolean,
  address: string | null,
  branch: BranchProps | null,
) => {
  const [yandexKeyIndex, setYandexKeyIndex] = useState(0);

  const geocodeQuery = useQuery({
    enabled: open && Boolean(address) && Boolean(branch),
    queryKey: [
      REACT_QUERY_KEYS.ORDER_DETAIL_ADDRESS_GEOCODE,
      address,
      branch?.longitude,
      branch?.latitude,
    ],
    queryFn: () =>
      requestYandexGeocode({
        params: {
          format: "json",
          lang: YANDEX_LANG,
          geocode: address as string,
          ll: `${branch?.longitude},${branch?.latitude}`,
          spn: "0.5,0.5",
          rspn: "1",
        },
        keyIndex: yandexKeyIndex,
        setKeyIndex: setYandexKeyIndex,
      }),
    staleTime: Infinity,
    retry: false,
  });

  const customerPoint = useMemo<Coordinates | null>(() => {
    const pos = geocodeQuery.data?.response?.GeoObjectCollection
      ?.featureMember?.[0]?.GeoObject?.Point?.pos
      ?.split(" ")
      .map(Number);

    return pos && pos.length >= 2 ? [pos[0], pos[1]] : null;
  }, [geocodeQuery.data]);

  return customerPoint;
};
