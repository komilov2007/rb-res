// TODO(booking-mock): VAQTINCHA. Bron backend'i tayyor bo'lgach bu faylni o'chirib,
// apis/reservation.ts dagi RESERVATION_MOCK ni false qiling.
// Bronlar localStorage'da saqlanadi — shu qurilma/brauzer doirasida ishlaydi.

import { getQueryClient } from "@/configs/react-query";
import { REACT_QUERY_KEYS } from "@/constants/react-query-keys";
import { useAuthStore } from "@/stores/auth";
import type { BranchProps } from "@/types/branch";
import type {
  CreateReservationPayload,
  ReservationListParams,
  ReservationListResponse,
  ReservationProps,
  UpdateReservationPayload,
} from "@/types/reservation";

const STORAGE_KEY = "rb-reservations-mock";
const LATENCY_MS = 400;

type MockResponse<T> = { data: T };

const respond = <T>(data: T) =>
  new Promise<MockResponse<T>>((resolve) =>
    setTimeout(() => resolve({ data }), LATENCY_MS),
  );

const notFound = () =>
  new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error("Reservation not found")), LATENCY_MS),
  );

const read = (): ReservationProps[] => {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];

    return Array.isArray(parsed) ? (parsed as ReservationProps[]) : [];
  } catch {
    return [];
  }
};

const write = (items: ReservationProps[]) => {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
};

// Filial nomi/manzili booking sahifasi allaqachon yuklagan ro'yxatdan olinadi
const findBranch = (branchId: number) => {
  const cached = getQueryClient().getQueriesData<{ data: BranchProps[] }>({
    queryKey: [REACT_QUERY_KEYS.RESERVATION_BRANCHES],
  });
  const branch = cached
    .flatMap(([, response]) => response?.data ?? [])
    .find((item) => item.id === branchId);

  return {
    id: branchId,
    name: branch?.name ?? `#${branchId}`,
    address: branch?.address ?? "",
    phone: branch?.phone ?? null,
  };
};

const toTime = (time: string) => (time.length === 5 ? `${time}:00` : time);

export const createReservation = async (data: CreateReservationPayload) => {
  const auth = useAuthStore.getState().auth;
  const now = new Date().toISOString();
  const items = read();
  const reservation: ReservationProps = {
    id: Math.max(0, ...items.map((item) => item.id)) + 1,
    branch: findBranch(data.branch),
    botuser: auth?.customer ?? 0,
    name: data.name ?? auth?.firstname ?? "",
    phone: auth?.phone ?? "",
    extra_phone: data.extra_phone ?? null,
    date: data.date,
    time: toTime(data.time),
    guests: data.guests,
    comment: data.comment ?? null,
    status: "PENDING",
    seller_comment: null,
    answered_at: null,
    cancelled_at: null,
    created_at: now,
    updated_at: now,
  };

  write([reservation, ...items]);

  return respond(reservation);
};

export const getReservations = async (params: ReservationListParams) => {
  const statuses = params.status?.split(",").filter(Boolean);
  const filtered = read()
    .filter((item) => !statuses || statuses.includes(item.status))
    .filter((item) => !params.branch || String(item.branch.id) === params.branch)
    .filter((item) => !params.date_after || item.date >= params.date_after)
    .filter((item) => !params.date_before || item.date <= params.date_before)
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
  const end = params.offset + params.limit;

  return respond<ReservationListResponse>({
    count: filtered.length,
    next: end < filtered.length ? "mock-next" : null,
    previous: params.offset > 0 ? "mock-previous" : null,
    results: filtered.slice(params.offset, end),
  });
};

export const getReservationDetail = async (reservationId: number | string) => {
  const reservation = read().find((item) => String(item.id) === String(reservationId));

  return reservation ? respond(reservation) : notFound();
};

const patch = (
  reservationId: number | string,
  changes: (item: ReservationProps) => Partial<ReservationProps>,
) => {
  const items = read();
  const index = items.findIndex((item) => String(item.id) === String(reservationId));

  if (index === -1) return notFound();

  const updated: ReservationProps = {
    ...items[index],
    ...changes(items[index]),
    updated_at: new Date().toISOString(),
  };

  items[index] = updated;
  write(items);

  return respond(updated);
};

export const updateReservation = async (
  reservationId: number | string,
  data: UpdateReservationPayload,
) =>
  patch(reservationId, (item) => ({
    ...(data.branch !== undefined && { branch: findBranch(data.branch) }),
    ...(data.name !== undefined && { name: data.name }),
    ...(data.extra_phone !== undefined && { extra_phone: data.extra_phone }),
    ...(data.date !== undefined && { date: data.date }),
    ...(data.time !== undefined && { time: toTime(data.time) }),
    ...(data.guests !== undefined && { guests: data.guests }),
    comment: data.comment !== undefined ? data.comment : item.comment,
  }));

export const cancelReservation = async (reservationId: number | string) =>
  patch(reservationId, () => ({
    status: "CANCELLED",
    cancelled_at: new Date().toISOString(),
  }));
