import { isAxiosError } from "axios";

import { translate } from "@/utils/translate";

export const getApiErrorMessage = (
  error: unknown,
  fallback: string = translate("errors_generic"),
) => {
  if (isAxiosError(error)) {
    if (typeof error.response?.data?.message === "string") {
      return error.response.data.message;
    }

    if (!error.response) {
      return error.code === "ECONNABORTED"
        ? translate("errors_timeout")
        : translate("errors_network");
    }
  }

  return fallback;
};
