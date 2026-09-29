"use client";

import { useGeneral } from "@/hooks/useGeneral";
import { useProfile } from "@/hooks/useProfile";
import { getCartTotal } from "@/utils/cart";
import { PRICED_DELIVERY_TYPES } from "@/constants/delivery-type";
import type { OrderFormValues } from "@/types/order";
import type { UnavailableState } from "./constants";
import type { CartItemProps } from "@/types/cart";

type UseOrderTotalsProps = {
  carts: CartItemProps[];
  unavailable: UnavailableState | null;
  deliveryType: OrderFormValues["delivery_type"];
  branch: OrderFormValues["branch"];
  isDelivery: boolean;
  deliveryPrice: OrderFormValues["delivery_price"];
  deliveryPriceType: OrderFormValues["delivery_price_type"];
  spendCashback: OrderFormValues["spend_cashback"];
  promoTotal: OrderFormValues["total"];
  general: ReturnType<typeof useGeneral>["data"];
  profile: ReturnType<typeof useProfile>["data"];
};

// The order's money: cart subtotal, excluded (unavailable) lines, delivery
// fee, cashback and promo — and the final amount shown and charged.
export const useOrderTotals = ({
  carts,
  unavailable,
  deliveryType,
  branch,
  isDelivery,
  deliveryPrice,
  deliveryPriceType,
  spendCashback,
  promoTotal,
  general,
  profile,
}: UseOrderTotalsProps) => {
  // Cart item ids createOrder reported unavailable for the current
  // service/branch — only marked in the cart; the order keeps the whole
  // cart so a branch change re-checks every item.
  const unavailableItemIds =
    unavailable &&
    unavailable.deliveryType === deliveryType &&
    unavailable.branch === branch
      ? unavailable.ids
      : [];

  const cartTotal = getCartTotal(carts);
  // Delivery is only charged for address deliveries with a FIXED/FLEXABLE
  // delivery price type.
  const orderDeliveryPrice =
    isDelivery &&
    typeof deliveryPrice === "number" &&
    PRICED_DELIVERY_TYPES.includes(deliveryPriceType ?? "")
      ? deliveryPrice
      : 0;
  // Display only — the backend deducts the balance itself from the
  // spend_cashback flag.
  const cashbackBall =
    general?.data?.cashback_enabled && spendCashback
      ? (profile?.data.cashback_ball ?? 0)
      : 0;
  const appliedPromoTotal = typeof promoTotal === "number" ? promoTotal : null;
  // A promo replaces the cart total with the backend's discounted
  // total_amount; the undiscounted price is then shown struck through.
  const oldPrice =
    appliedPromoTotal !== null ? cartTotal + orderDeliveryPrice : null;
  // Must match the amount charged via the Telegram invoice.
  const displayTotal = Math.max(
    0,
    (appliedPromoTotal ?? cartTotal) +
      orderDeliveryPrice -
      cashbackBall,
  );

  return {
    unavailableItemIds,
    cartTotal,
    orderDeliveryPrice,
    cashbackBall,
    appliedPromoTotal,
    oldPrice,
    displayTotal,
  };
};
