"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { YANDEX_LANG } from "@/constants/yandex";
import type { BranchProps } from "@/types/branch";
import type { Coordinates } from "@/types/yandex";
import { requestYandexGeocode } from "@/utils/yandex";

// The delivery address's map point, geocoded from its text near the branch.
export const useCustomerPoint = (
  open: boolean,
  address: string | null,
  branch: BranchProps | null,
) => {
  const [yandexKeyIndex, setYandexKeyIndex] = useState(0);

  // OrderDetail's delivery address is plain text with no lat/lng (confirmed
  // — see order.ts) — this forward-geocodes it the same way the location
  // modal's own address search already does (src/utils/yandex.ts), instead
  // of inventing a backend coordinate field that doesn't exist. staleTime:
  // Infinity — a fixed order's address text never changes while this sheet
  // is open, so there's nothing to ever refetch; without this, a background
  // refetch (e.g. on window refocus) hands back a new `data` object for the
  // same coordinates, which was one source of the route being torn down and
  // rebuilt (and re-panned) more than once after the first settle.
  const geocodeQuery = useQuery({
    enabled: open && Boolean(address) && Boolean(branch),
    queryKey: [
      "order-detail-address-geocode",
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
          // Confirmed live (see delivery-route-sheet debugging notes): a
          // bare street/block address with no city name — exactly what
          // OrderDetail.address often is — can match a same-named street in
          // a completely different city/region ahead of the correct one in
          // Yandex's own ranking (verified: for one real address this put
          // a street 400km away, in a different province, as the #1
          // result, with the correct Tashkent match ranked 7th). `ll`
          // (search center) + `spn` (search span) + `rspn=1` (restrict
          // results to that span) biases/limits the geocoder to the area
          // around the fulfilling branch, which is where a real delivery
          // address has to be. spn 0.5° is a generous ~50km radius at this
          // latitude — comfortably covering any real delivery distance
          // without being wide enough to admit another city.
          ll: `${branch?.longitude},${branch?.latitude}`,
          spn: "0.5,0.5",
          rspn: "1",
        },
        keyIndex: yandexKeyIndex,
        setKeyIndex: setYandexKeyIndex,
      }),
    staleTime: Infinity,
    // requestYandexGeocode already cycles through every configured API key
    // itself before throwing — a failure here means every key was rejected
    // or the address genuinely can't be geocoded, neither of which a query
    // retry fixes. Default retry:3 was tripling that already-exhaustive
    // per-key loop for no benefit, just extra background network activity
    // while this sheet is open.
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
