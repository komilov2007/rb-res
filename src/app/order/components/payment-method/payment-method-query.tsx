"use client";

import { useSuspenseQuery } from "@tanstack/react-query";

import { getPaymentList, type PaymentListItem } from "@/apis/order";
import type { PaymentTypeProps } from "@/types/order";

import { PAYMENT_TYPE_ICON_MAP } from "./constants";
import PaymentGrid from "./payment-grid";

const ROBO_VARIANTS = ["ROBO_CLICK", "ROBO_PAYME", "ROBO_UZUM"] as const;

const ALL_ICON_MAPPED_TYPES = Object.keys(
  PAYMENT_TYPE_ICON_MAP,
) as PaymentTypeProps[];

// A card shows if its exact state is present in the API response, or if the
// response contains ROBO_PAY (which silently expands to the three ROBO_*
// cards). ROBO_PAY itself is a signal, never rendered as its own card.
const getVisiblePaymentTypes = (data: PaymentListItem[]): PaymentTypeProps[] => {
  const hasRoboPay = data.some((item) => item.state === "ROBO_PAY");

  return ALL_ICON_MAPPED_TYPES.reduce<PaymentTypeProps[]>((acc, type) => {
    const isInResponse = data.some((item) => item.state === type);
    const isRoboVariant = (ROBO_VARIANTS as readonly string[]).includes(type);
    const autoIncluded = hasRoboPay && isRoboVariant;

    if (!isInResponse && !autoIncluded) return acc;

    acc.push(type);

    return acc;
  }, []);
};

// ROBO_* cards don't carry their own availability flag — they follow the
// ROBO_PAY entry's is_available instead.
const isPaymentTypeDisabled = (
  type: PaymentTypeProps,
  data: PaymentListItem[],
): boolean => {
  if ((ROBO_VARIANTS as readonly string[]).includes(type)) {
    const roboPay = data.find((item) => item.state === "ROBO_PAY");

    return roboPay?.is_available === false;
  }

  const item = data.find((item) => item.state === type);

  return item?.is_available === false;
};

type PaymentMethodQueryProps = {
  shopid: string;
  deliveryType: string;
};

const PaymentMethodQuery = ({ shopid, deliveryType }: PaymentMethodQueryProps) => {
  const { data } = useSuspenseQuery({
    queryKey: ["payment-list", shopid, deliveryType],
    queryFn: () => getPaymentList(shopid, deliveryType),
  });

  const paymentList = data?.data ?? [];
  const visiblePaymentTypes = getVisiblePaymentTypes(paymentList);

  return (
    <PaymentGrid
      visiblePaymentTypes={visiblePaymentTypes}
      getIsDisabled={(type) => isPaymentTypeDisabled(type, paymentList)}
    />
  );
};

export default PaymentMethodQuery;
