import type { ComponentType } from "react";

import { translate } from "@/utils/translate";
import { Wallet } from "lucide-react";

import { IconCash } from "@/assets/icons/cash";
import { IconCards } from "@/assets/icons/cards";
import { IconUzum } from "@/assets/icons/uzum";
import IconPayme from "@/assets/icons/payme";
import { IconClick } from "@/assets/icons/click";
import { IconCardGlobal } from "@/assets/icons/cards-global";
import { IconUzumSolid } from "@/assets/icons/uzum-solid";
import { IconAlif } from "@/assets/icons/alif";
// File on disk is misspelled "bank-trasfer.tsx" — importing the real path.
import { IconBankTransfer } from "@/assets/icons/bank-trasfer";

import type { PaymentTypeProps } from "@/types/order";

// Originally lived inside order/components/payment-method (checkout-only),
// moved here (STEP 32.2) once the read-only order-detail view
// (src/components/order-detail-sections) also needed the same icon+label
// mapping to display a placed order's payment_type — now genuinely shared
// across two unrelated features, per this project's own component-ownership
// convention (AGENTS.md Section 3). ROBO_PAY intentionally excluded — it's
// a generic/catch-all status, not an icon-bearing payment method.
export const PAYMENT_TYPE_ICON_MAP: Partial<
  Record<PaymentTypeProps, ComponentType>
> = {
  CASH: IconCash,
  CARD: IconCards,
  UZUM: IconUzum,
  PAYME: IconPayme,
  CLICK: IconClick,
  PAYME_API: IconPayme,
  CLICK_API: IconClick,
  GLOBAL_PAY: IconCardGlobal,
  UZUM_NASIYA: IconUzumSolid,
  ALIF_NASIYA: IconAlif,
  BANK: IconBankTransfer,
  ROBO_CLICK: IconClick,
  ROBO_PAYME: IconPayme,
  ROBO_UZUM: IconUzum,
};

// Label per payment type — shown on checkout's payment-method cards and in
// the order-detail view. `label` is a getter so it always reads the current
// locale (messages: payment_types.*), without every consumer calling t().
const PAYMENT_LABEL_TYPES: PaymentTypeProps[] = [
  "CASH",
  "CARD",
  "PAYME",
  "CLICK",
  "UZUM",
  "PAYME_API",
  "CLICK_API",
  "GLOBAL_PAY",
  "UZUM_NASIYA",
  "ALIF_NASIYA",
  "BANK",
  "ROBO_CLICK",
  "ROBO_PAYME",
  "ROBO_UZUM",
];

export const PAYMENT_CARD_CONFIG: Partial<
  Record<PaymentTypeProps, { readonly label: string }>
> = Object.fromEntries(
  PAYMENT_LABEL_TYPES.map((type) => [
    type,
    {
      get label() {
        // Message keys are lower-case (payment_types_cash); the payment
        // type enum is upper-case (CASH).
        return translate(`payment_types_${type.toLowerCase()}`);
      },
    },
  ]),
);

export const getPaymentIcon = (value: PaymentTypeProps) => {
  const Icon = PAYMENT_TYPE_ICON_MAP[value];

  if (!Icon) {
    console.warn(`No icon mapped for payment type "${value}"`);

    return Wallet;
  }

  return Icon;
};
