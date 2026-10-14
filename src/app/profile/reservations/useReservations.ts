"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { cancelReservation, getReservations } from "@/apis/reservation";
import { isPastSlot } from "@/app/booking/utils";
import { getDateValue } from "@/utils/format-date";
import { REACT_QUERY_KEYS } from "@/constants/react-query-keys";
import { useAuthStore } from "@/stores/auth";
import type { ReservationProps } from "@/types/reservation";

const RESERVATIONS_LIMIT = 10;
const ACTIVE_STATUSES = "PENDING,ACCEPTED";

export const useReservations = () => {
  const t = useTranslations();
  const queryClient = useQueryClient();
  const hasAccess = useAuthStore((state) => state.hasAccess);
  const [isActive, setIsActive] = useState(true);
  const [cancelTarget, setCancelTarget] = useState<ReservationProps | null>(
    null,
  );
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const today = getDateValue(new Date());

  const {
    data,
    isLoading,
    isFetching,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    enabled: hasAccess,
    queryKey: [REACT_QUERY_KEYS.RESERVATIONS, isActive, today],
    initialPageParam: 0,
    queryFn: ({ pageParam }) =>
      getReservations({
        limit: RESERVATIONS_LIMIT,
        offset: pageParam,
        status: isActive ? ACTIVE_STATUSES : undefined,
        date_after: isActive ? today : undefined,
      }),
    getNextPageParam: (lastPage, allPages) =>
      lastPage.data.next ? allPages.length * RESERVATIONS_LIMIT : undefined,
  });

  const allReservations =
    data?.pages.flatMap((page) => page.data.results) ?? [];
  const reservations = isActive
    ? allReservations.filter(
        ({ date, time }) => date >= today && !isPastSlot(date, time),
      )
    : allReservations;

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;

      if (
        !entry?.isIntersecting ||
        !hasNextPage ||
        isFetching ||
        isFetchingNextPage
      ) {
        return;
      }

      fetchNextPage();
    },
    [fetchNextPage, hasNextPage, isFetching, isFetchingNextPage],
  );

  useEffect(() => {
    if (!hasNextPage || !bottomRef.current) return;

    const observer = new IntersectionObserver(handleObserver, {
      rootMargin: "600px 0px",
      threshold: 0.01,
    });

    observer.observe(bottomRef.current);

    return () => observer.disconnect();
  }, [handleObserver, hasNextPage]);

  const cancelMutation = useMutation({
    mutationFn: (reservation: ReservationProps) =>
      cancelReservation(reservation.id),
    onSuccess: (_, reservation) => {
      toast.success(t("reservations_cancel_success"));
      setCancelTarget(null);
      queryClient.invalidateQueries({
        queryKey: [REACT_QUERY_KEYS.RESERVATIONS],
      });
      queryClient.invalidateQueries({
        queryKey: [REACT_QUERY_KEYS.RESERVATION_DETAIL, String(reservation.id)],
      });
    },
  });

  return {
    reservations,
    isActive,
    setIsActive,
    isLoading,
    isFetchingNextPage,
    bottomRef,
    cancelTarget,
    setCancelTarget,
    confirmCancel: cancelMutation.mutate,
    isCancelling: cancelMutation.isPending,
  };
};
