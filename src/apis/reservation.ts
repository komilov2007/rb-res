import { request } from "@/configs/requests";
import type {
  CreateReservationPayload,
  ReservationListParams,
  ReservationListResponse,
  ReservationProps,
  UpdateReservationPayload,
} from "@/types/reservation";

export const createReservation = async (data: CreateReservationPayload) => {
  return await request.post<ReservationProps>(
    "webapp/reservation/create",
    data,
  );
};

export const getReservations = async (params: ReservationListParams) => {
  return await request<ReservationListResponse>("webapp/reservation/list", {
    params,
  });
};

export const getReservationDetail = async (reservationId: number | string) => {
  return await request<ReservationProps>(
    `webapp/reservation/${reservationId}/detail`,
  );
};

export const updateReservation = async (
  reservationId: number | string,
  data: UpdateReservationPayload,
) => {
  return await request.patch<ReservationProps>(
    `webapp/reservation/${reservationId}/update`,
    data,
  );
};

export const cancelReservation = async (reservationId: number | string) => {
  return await request.post<ReservationProps>(
    `webapp/reservation/${reservationId}/cancel`,
  );
};
