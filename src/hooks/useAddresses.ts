"use client";

import { useQuery } from "@tanstack/react-query";

import { getAddresses } from "@/apis/address";
import { REACT_QUERY_KEYS } from "@/constants/react-query-keys";

export const useAddresses = (
  customerId: number | undefined,
  enabled: boolean = Boolean(customerId),
) =>
  useQuery({
    enabled,
    queryKey: [REACT_QUERY_KEYS.USER_ADDRESSES, customerId],
    queryFn: getAddresses,
  });
