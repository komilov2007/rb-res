export type ReservationStatus =
  | "PENDING"
  | "ACCEPTED"
  | "REJECTED"
  | "CANCELLED";

export type ReservationBranchProps = {
  id: number;
  name: string;
  address: string;
  phone: string | null;
};

export type ReservationProps = {
  id: number;
  branch: ReservationBranchProps;
  botuser: number;
  name: string;
  phone: string;
  extra_phone: string | null;
  date: string;
  time: string;
  guests: number;
  comment: string | null;
  status: ReservationStatus;
  seller_comment: string | null;
  answered_at: string | null;
  cancelled_at: string | null;
  created_at: string;
  updated_at: string;
};

export type ReservationListResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: ReservationProps[];
};

export type ReservationListParams = {
  limit: number;
  offset: number;
  status?: string;
  branch?: string;
  date_after?: string;
  date_before?: string;
};

export type CreateReservationPayload = {
  branch: number;
  name?: string;
  extra_phone?: string;
  date: string;
  time: string;
  guests: number;
  comment?: string;
};

export type UpdateReservationPayload = Partial<CreateReservationPayload>;
