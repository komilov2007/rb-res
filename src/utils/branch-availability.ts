import { toast } from "sonner";

import { translate } from "@/utils/translate";

// Uzbek source string, kept exported for compatibility — use
// getProductUnavailableMessage() for the current locale.
export const PRODUCT_UNAVAILABLE_MESSAGE =
  "Bu mahsulot tanlangan filialda mavjud emas";

export const getProductUnavailableMessage = () =>
  translate("product_unavailable");

// A fixed toast id keeps repeated taps from stacking duplicate toasts.
export const showProductUnavailable = (details?: string) =>
  toast.error(
    details
      ? `${getProductUnavailableMessage()}: ${details}`
      : getProductUnavailableMessage(),
    { id: "product-unavailable" },
  );
