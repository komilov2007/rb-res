"use client";

import { createElement, Fragment, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  FileText,
  Footprints,
  MapPin,
  UtensilsCrossed,
} from "lucide-react";
import { useTranslations } from "next-intl";

import { getBranches } from "@/apis/branches";
import { useGeneral } from "@/hooks/useGeneral";
import { useShopid } from "@/hooks/useShopId";
import { getShortAddress } from "@/utils/address";
import { formatPrice } from "@/utils/format-price";
import { IMAGE_PLACEHOLDER_SRC, handleImageFallback } from "@/utils/image";
import type {
  OrderDetail,
  PaymentTypeProps,
  ServiceTypeValue,
} from "@/types/order";

import BranchInfoSheet from "@/components/branch-info-sheet";
import DeliveryRouteSheet from "@/components/delivery-route-sheet";
import StatusTimeline from "@/components/status-timeline";
import { PAYMENT_CARD_CONFIG, getPaymentIcon } from "@/constants/payment-types";

// Confirmed set — provider-delivery service types count as "delivery" for
// the address-display rule below, matching order-placing's own check
// (STEP 32) that this section set was extracted from.
const DELIVERY_TYPES: ServiceTypeValue[] = [
  "DELIVERY",
  "NOOR_DELIVERY",
  "YANDEX_DELIVERY",
];

// Display-only labels for the "Xizmat turi" row's free-of-charge fallback —
// not a new backend contract, just copy for the already-confirmed
// ServiceTypeValue enum.
const SERVICE_TYPE_LABELS: Record<ServiceTypeValue, string> = {
  PICKUP: "orders_service_types_pickup",
  BTS_PICKUP: "orders_service_types_pickup",
  DELIVERY: "orders_service_types_delivery",
  YANDEX_DELIVERY: "orders_service_types_yandex_delivery",
  NOOR_DELIVERY: "orders_service_types_noor_delivery",
};

type OrderDetailSectionsProps = {
  detail: OrderDetail;
};

// Darker than the page's usual muted gray (text-gray220) but deliberately
// kept at font-normal — a touch more contrast without turning these into a
// second layer of bold headings competing with the value/price text.
const SectionLabel = ({
  icon,
  children,
}: {
  icon: ReactNode;
  children: ReactNode;
}) => (
  <div className="flex items-center gap-2 text-[11px] font-normal tracking-wide text-black/90 ">
    {icon}
    {children}
  </div>
);

const InfoRow = ({
  label,
  value,
  valueClassName = "text-black",
}: {
  label: string;
  value: ReactNode;
  valueClassName?: string;
}) => (
  <div className="flex items-center justify-between text-sm">
    <span className="font-medium text-gray220">{label}</span>
    <span className={`font-medium ${valueClassName}`}>{value}</span>
  </div>
);

// The read-only sections of an order's detail view (status, pickup/delivery
// address, items, payment/price breakdown) — shared by order-placing (the
// post-checkout flow) and my-orders' own order detail route, so the two look
// identical. Padding lives once on the outer wrapper (`divide-y` draws the
// section dividers inside it) so every section — and its divider — sits at
// the exact same distance from the screen edge, instead of each `<section>`
// repeating its own px-4.
const OrderDetailSections = ({ detail }: OrderDetailSectionsProps) => {
  const t = useTranslations();
  const [mapOpen, setMapOpen] = useState(false);
  const [routeMapOpen, setRouteMapOpen] = useState(false);
  const { shopid } = useShopid();
  const { data: general } = useGeneral();
  const isDelivery = DELIVERY_TYPES.includes(detail.service_type);
  const displayAddress = isDelivery ? detail.address : detail.branch.address;

  // Same queryKey as src/app/[page]/components/branch-selection's
  // useBranchSelection — the full branch list (with lat/lng), so this shares
  // its cache instead of refetching. detail.branch only carries
  // id/name/address, not coordinates — needed for both cases now: the
  // pickup branch-info sheet, and the delivery route sheet's "ships from"
  // point.
  const { data: branches } = useQuery({
    enabled: Boolean(shopid),
    queryKey: ["branches", shopid],
    queryFn: () => getBranches(shopid as string),
  });
  const mapBranch =
    branches?.data.find((item) => item.id === detail.branch.id) ?? null;
  const amount = Number(detail.amount);
  const deliveryPrice = Number(detail.delivery_price) || 0;
  const paymentType = detail.payment_type as PaymentTypeProps;
  const paymentLabel =
    PAYMENT_CARD_CONFIG[paymentType]?.label ?? detail.payment_type;
  const hasDiscount =
    typeof detail.discount_amount === "number" && detail.discount_amount > 0;
  const promoPercent =
    (detail.promo_code?.type === "PERCENT" ||
      detail.promo_code?.type === "PERCENTAGE") &&
    typeof detail.promo_code.percent === "number"
      ? detail.promo_code.percent
      : null;
  // `item.amount` is treated as the line total (same reading my-orders'
  // own summary uses for the products subtotal).
  const itemsSubtotal = detail.items.reduce(
    (sum, item) => sum + (typeof item.amount === "number" ? item.amount : 0),
    0,
  );

  return (
    <Fragment>
      <div className="flex flex-col divide-y divide-gray180 px-4">
        <section className="py-5">
          <StatusTimeline status={detail.status.status} />
        </section>

        <section className="py-5">
          <SectionLabel
            icon={isDelivery ? <MapPin size={13} /> : <Footprints size={13} />}
          >
            {isDelivery
              ? t("orders_detail_delivery_address")
              : t("orders_detail_pickup_address")}
          </SectionLabel>
          {isDelivery ? (
            // Delivery: one compact row for the customer's own delivery
            // address — the fulfilling branch isn't shown here at all
            // anymore, only inside the route sheet this opens (below), so
            // it's not repeated twice for the same order.
            <button
              type="button"
              disabled={!mapBranch}
              onClick={() => setRouteMapOpen(true)}
              className="mt-3 flex w-full items-center gap-3 text-left disabled:pointer-events-none"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray10 text-gray220">
                <MapPin size={18} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-black">
                  {t("orders_detail_delivery_address")}
                </p>
                {displayAddress && (
                  <p className="mt-0.5 truncate text-xs font-medium text-gray220">
                    {getShortAddress(displayAddress)}
                  </p>
                )}
              </div>
              {mapBranch && (
                <ChevronRight size={18} className="shrink-0 text-gray220" />
              )}
            </button>
          ) : mapBranch ? (
            <button
              type="button"
              onClick={() => setMapOpen(true)}
              className="mt-3 flex w-full items-start gap-3 text-left"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray10 text-gray220">
                <MapPin size={18} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-black">
                  {t("orders_detail_branch_with_name", {
                    name: detail.branch.name,
                  })}
                </p>
                {displayAddress && (
                  <p className="mt-0.5 text-xs font-medium text-gray220">
                    {displayAddress}
                  </p>
                )}
              </div>
              <ChevronRight
                size={18}
                className="mt-1.5 shrink-0 text-gray220"
              />
            </button>
          ) : (
            <div className="mt-3 flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray10 text-gray220">
                <MapPin size={18} />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-medium text-black">
                  {t("orders_detail_branch_with_name", {
                    name: detail.branch.name,
                  })}
                </p>
                {displayAddress && (
                  <p className="mt-0.5 text-xs font-medium text-gray220">
                    {displayAddress}
                  </p>
                )}
              </div>
            </div>
          )}
        </section>

        <section className="py-5">
          <SectionLabel icon={<UtensilsCrossed size={13} />}>
            {t("orders_detail_items_title")}
          </SectionLabel>
          <ul className="mt-3 flex flex-col gap-3">
            {detail.items.map((item, index) => (
              <li key={item.id ?? index} className="flex items-center gap-3">
                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-gray10">
                  <img
                    src={item.photo || IMAGE_PLACEHOLDER_SRC}
                    alt=""
                    onError={handleImageFallback}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-black">
                    {item.name ?? t("orders_detail_product_fallback")}
                  </p>
                  <p className="text-xs font-medium text-gray220">
                    {item.count ?? 1}{" "}
                    {item.unit ?? t("orders_detail_unit_fallback")}
                  </p>
                </div>
                {typeof item.amount === "number" && (
                  <p className="shrink-0 text-sm font-medium text-black">
                    {formatPrice(item.amount)} {t("sum")}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </section>

        <section className="py-5">
          <SectionLabel icon={<FileText size={13} />}>
            {t("orders_detail_payment_info")}
          </SectionLabel>
          <div className="mt-3 flex flex-col gap-2.5">
            <InfoRow
              label={t("orders_detail_products_price")}
              value={`${formatPrice(itemsSubtotal)} ${t("sum")}`}
            />
            {(hasDiscount || promoPercent !== null) && (
              <InfoRow
                label={t("discount")}
                valueClassName="text-green-500"
                value={
                  <span className="inline-flex items-center gap-2">
                    {promoPercent !== null && (
                      <span className="rounded-full bg-red px-2 py-0.5 text-[10px] font-medium leading-none text-white">
                        -{promoPercent}%
                      </span>
                    )}
                    {hasDiscount
                      ? `-${formatPrice(detail.discount_amount ?? 0)} ${t("sum")}`
                      : null}
                  </span>
                }
              />
            )}
            <InfoRow
              label={t("service_type")}
              value={
                SERVICE_TYPE_LABELS[detail.service_type]
                  ? t(SERVICE_TYPE_LABELS[detail.service_type])
                  : detail.service_type
              }
            />
            {isDelivery && (
              <InfoRow
                label={t("order_page_summary_delivery_price")}
                value={`${formatPrice(deliveryPrice)} ${t("sum")}`}
              />
            )}
            <InfoRow
              label={t("orders_detail_payment_method")}
              value={
                <span className="inline-flex items-center gap-2">
                  <span className="flex h-5 shrink-0 items-center overflow-hidden [&_svg]:h-auto [&_svg]:max-h-5 [&_svg]:w-auto [&_svg]:max-w-14">
                    {createElement(getPaymentIcon(paymentType))}
                  </span>
                  {paymentLabel}
                </span>
              }
            />
            <InfoRow
              label={t("orders_detail_payment_status")}
              valueClassName={detail.is_paid ? "text-green-500" : "text-red"}
              value={
                <span className="inline-flex items-center gap-2">
                  {detail.is_paid ? (
                    <CheckCircle2 size={14} />
                  ) : (
                    <AlertCircle size={14} />
                  )}
                  {detail.is_paid
                    ? t("orders_detail_paid")
                    : t("orders_detail_unpaid")}
                </span>
              }
            />
          </div>

          <div className="mt-3 border-t border-gray180 pt-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-black">
                {t("orders_detail_total_payment")}:
              </span>
              <span className="text-xl font-medium text-black">
                {formatPrice(amount)} {t("sum")}
              </span>
            </div>
          </div>
        </section>
      </div>

      <BranchInfoSheet
        open={mapOpen}
        onClose={() => setMapOpen(false)}
        branch={mapBranch}
        workingTime={general?.data.working_time}
      />

      <DeliveryRouteSheet
        open={routeMapOpen}
        onClose={() => setRouteMapOpen(false)}
        branch={mapBranch}
        address={detail.address}
      />
    </Fragment>
  );
};

export default OrderDetailSections;
