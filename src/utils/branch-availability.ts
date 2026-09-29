import { toast } from "sonner";

import { translate } from "@/utils/translate";

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
