import { isAxiosError } from "axios";

import { translate } from "@/utils/translate";

// Uzbek source strings, kept exported for compatibility — user-facing
// output goes through translate() below (errors.* keys).
export const GENERIC_ERROR_MESSAGE = "Xatolik yuz berdi, qayta urinib ko'ring.";
export const NETWORK_ERROR_MESSAGE =
  "Internet aloqasi yo'q. Ulanishni tekshirib, qayta urinib ko'ring.";
export const TIMEOUT_ERROR_MESSAGE =
  "So'rov vaqti tugadi. Qayta urinib ko'ring.";

// The shared request instance surfaces backend errors as ordinary
// AxiosErrors with a `{ message, ... }` body (confirmed live — e.g. the
// 401 interceptor path's `{"message":"...","code":"not_authenticated"}`,
// and the promo-code endpoint's own `{"message":"Promo-kod
// topilmadi","errors":[]}` / `{"message":"Eng kam miqdor ... dan katta
// bo'lishi kerak","code":"error","errors":[]}`) — this reads that real
// message instead of a hardcoded string. A request that never reached the
// backend (offline, timeout) has no response body at all, so that case gets
// its own generic message instead of falling through to `fallback` (which
// callers write assuming a real backend rejection, e.g. "Promo-kodni
// qo'llab bo'lmadi." — misleading for a plain connectivity failure).
export const getApiErrorMessage = (
  error: unknown,
  fallback: string = translate("errors.generic"),
) => {
  if (isAxiosError(error)) {
    if (typeof error.response?.data?.message === "string") {
      return error.response.data.message;
    }

    if (!error.response) {
      return error.code === "ECONNABORTED"
        ? translate("errors.timeout")
        : translate("errors.network");
    }
  }

  return fallback;
};
