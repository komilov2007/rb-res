"use client";

import { useSuspenseQuery } from "@tanstack/react-query";

import { getPaymentList, type PaymentListItem } from "@/apis/order";
import type { PaymentTypeProps } from "@/types/order";

import { PAYMENT_TYPE_ICON_MAP } from "@/constants/payment-types";
import PaymentGrid from "./payment-grid";
import { REACT_QUERY_KEYS } from "@/constants/react-query-keys";

const ROBO_VARIANTS = ["ROBO_CLICK", "ROBO_PAYME", "ROBO_UZUM"] as const;

const ALL_ICON_MAPPED_TYPES = Object.keys(
  PAYMENT_TYPE_ICON_MAP,
) as PaymentTypeProps[];

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
    queryKey: [REACT_QUERY_KEYS.PAYMENT_LIST, shopid, deliveryType],
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
