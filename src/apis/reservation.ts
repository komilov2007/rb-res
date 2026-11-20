import { request } from "@/configs/requests";
import { getBranches } from "@/apis/branches";
import * as reservationMock from "@/apis/reservation.mock";
import type {
  CreateReservationPayload,
  ReservationListParams,
  ReservationListResponse,
  ReservationProps,
  UpdateReservationPayload,
} from "@/types/reservation";

// TODO(booking-mock): bron backend'i tayyor bo'lgach false qiling va
// apis/reservation.mock.ts ni o'chiring.
export const RESERVATION_MOCK = true;

const createReservationApi = async (data: CreateReservationPayload) => {
  return await request.post<ReservationProps>(
    "webapp/reservation/create",
    data,
  );
};

const getReservationsApi = async (params: ReservationListParams) => {
  return await request<ReservationListResponse>("webapp/reservation/list", {
    params,
  });
};

const getReservationDetailApi = async (reservationId: number | string) => {
  return await request<ReservationProps>(
    `webapp/reservation/${reservationId}/detail`,
  );
};

const updateReservationApi = async (
  reservationId: number | string,
  data: UpdateReservationPayload,
) => {
  return await request.patch<ReservationProps>(
    `webapp/reservation/${reservationId}/update`,
    data,
  );
};

const cancelReservationApi = async (reservationId: number | string) => {
  return await request.post<ReservationProps>(
    `webapp/reservation/${reservationId}/cancel`,
  );
};

// Mock rejimida bron xizmati yoqilmagan filiallar ham ko'rinsin —
// aks holda RESERVATION filtri bo'sh ro'yxat qaytarib, bron qilib bo'lmaydi.
export const getReservationBranches = async (shopid: string) =>
  getBranches(
    shopid,
    RESERVATION_MOCK
      ? { is_active: true }
      : { service: "RESERVATION", is_active: true },
  );

export const createReservation = RESERVATION_MOCK
  ? reservationMock.createReservation
  : createReservationApi;

export const getReservations = RESERVATION_MOCK
  ? reservationMock.getReservations
  : getReservationsApi;

export const getReservationDetail = RESERVATION_MOCK
  ? reservationMock.getReservationDetail
  : getReservationDetailApi;

export const updateReservation = RESERVATION_MOCK
  ? reservationMock.updateReservation
  : updateReservationApi;

export const cancelReservation = RESERVATION_MOCK
  ? reservationMock.cancelReservation
  : cancelReservationApi;
