"use client";

import { CalendarClock } from "lucide-react";
import { useTranslations } from "next-intl";

import LoginRequired from "@/components/login-required";
import { useAuthStore } from "@/stores/auth";

import ProfilePageShell from "../components/profile-page-shell";
import CancelReservationDialog from "./components/cancel-reservation-dialog";
import ReservationCard from "./components/reservation-card";
import { ReservationCardSkeleton } from "./components/reservation-card/reservation-card";
import { useReservations } from "./useReservations";

const TABS = [
  { key: true, label: "orders_tabs_active" },
  { key: false, label: "orders_tabs_all" },
] as const;

const EmptyReservations = () => {
  const t = useTranslations();

  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray10 text-gray220">
        <CalendarClock size={28} strokeWidth={1.8} />
      </div>
      <h3 className="mt-4 text-base font-medium text-black">
        {t("reservations_empty_title")}
      </h3>
      <p className="mt-2 max-w-[280px] text-sm leading-6 text-gray220">
        {t("reservations_empty_hint")}
      </p>
    </div>
  );
};

const ReservationsContent = () => {
  const t = useTranslations();
  const {
    reservations,
    isActive,
    setIsActive,
    isLoading,
    isFetchingNextPage,
    bottomRef,
    cancelTarget,
    setCancelTarget,
    confirmCancel,
    isCancelling,
  } = useReservations();

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        {TABS.map((tab) => (
          <button
            key={String(tab.key)}
            type="button"
            onClick={() => setIsActive(tab.key)}
            className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-medium ${
              isActive === tab.key
                ? "bg-primary text-white"
                : "bg-white text-gray220 lg:bg-gray10"
            }`}
          >
            {t(tab.label)}
          </button>
        ))}
      </div>

      {isLoading ? (
        <>
          <ReservationCardSkeleton />
          <ReservationCardSkeleton />
        </>
      ) : reservations.length === 0 ? (
        <EmptyReservations />
      ) : (
        <>
          {reservations.map((reservation) => (
            <ReservationCard key={reservation.id} reservation={reservation} />
          ))}
          {isFetchingNextPage && <ReservationCardSkeleton />}
        </>
      )}
      <div ref={bottomRef} className="h-1" />

      <CancelReservationDialog
        reservation={cancelTarget}
        isCancelling={isCancelling}
        onClose={() => setCancelTarget(null)}
        onConfirm={confirmCancel}
      />
    </div>
  );
};

const Reservations = () => {
  const t = useTranslations();
  const hasAccess = useAuthStore((state) => state.hasAccess);

  return (
    <ProfilePageShell title={t("profile_page_menu_reservations")}>
      {hasAccess ? (
        <ReservationsContent />
      ) : (
        <LoginRequired message={t("reservations_login_required")} />
      )}
    </ProfilePageShell>
  );
};

export default Reservations;
