// Icon/label mapping moved to src/constants/payment-types.ts (STEP 32.2) —
// re-exported here so existing imports of these names from this file keep
// working unchanged.
export {
  PAYMENT_TYPE_ICON_MAP,
  PAYMENT_CARD_CONFIG,
  getPaymentIcon,
} from "@/constants/payment-types";
