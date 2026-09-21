"use client";

import { useQuery } from "@tanstack/react-query";

import { getAddresses } from "@/apis/address";

// The customer's saved delivery addresses, keyed by customer id. `enabled`
// defaults to "a customer id exists"; callers that also require an active
// session pass their own condition.
export const useAddresses = (
  customerId: number | undefined,
  enabled: boolean = Boolean(customerId),
) =>
  useQuery({
    enabled,
    queryKey: ["user-addresses", customerId],
    queryFn: getAddresses,
  });
