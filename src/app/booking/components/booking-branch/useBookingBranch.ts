"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useFormContext, useWatch, useFormState } from "react-hook-form";

import { getBranches } from "@/apis/branches";
import { REACT_QUERY_KEYS } from "@/constants/react-query-keys";
import { useShopId } from "@/hooks/useShopId";

import type { BookingFormValues } from "@/app/booking/booking";

export const useBookingBranch = () => {
  const { shopid, hasShopId } = useShopId();
  const {
    control,
    setValue,
  } = useFormContext<BookingFormValues>();
  const { errors } = useFormState<BookingFormValues>();
  const branch = useWatch({ control, name: "branch" });

  const { data, isLoading } = useQuery({
    enabled: hasShopId,
    queryKey: [REACT_QUERY_KEYS.RESERVATION_BRANCHES, shopid],
    queryFn: () =>
      getBranches(shopid as string, { service: "RESERVATION", is_active: true }),
  });
  const branches = data?.data;

  useEffect(() => {
    if (branch || branches?.length !== 1) return;

    setValue("branch", branches[0].id, { shouldValidate: true });
  }, [branch, branches, setValue]);

  const selectBranch = (value: string) => {
    setValue("branch", Number(value), {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  return {
    branches: branches ?? [],
    value: branch ? String(branch) : "",
    isLoading,
    selectBranch,
    error: errors.branch?.message,
  };
};
