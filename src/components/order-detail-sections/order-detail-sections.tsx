"use client";

import type { ServiceTypeValue, OrderDetail } from "@/types/order";
import type { ReactNode } from "react";
import { Fragment, useState } from "react";
import { ChevronRight, Footprints } from "lucide-react";
import { IconMapPinFilled, IconToolsKitchen2Filled } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { useGeneral } from "@/hooks/useGeneral";
import { getShortAddress } from "@/utils/address";
import { formatPrice } from "@/utils/format-price";
import { IMAGE_PLACEHOLDER_SRC, handleImageFallback } from "@/utils/image";
import BranchInfoSheet from "@/components/branch-info-sheet";
import DeliveryRouteSheet from "@/components/delivery-route-sheet";
import StatusTimeline from "@/components/status-timeline";
import { useBranches } from "@/hooks/useBranches";
import PaymentSection from "./payment-section";

export const DELIVERY_TYPES: ServiceTypeValue[] = [
  "DELIVERY",
  "NOOR_DELIVERY",
  "YANDEX_DELIVERY",
];

export const SERVICE_TYPE_LABELS: Record<ServiceTypeValue, string> = {
  PICKUP: "orders_service_types_pickup",
  BTS_PICKUP: "orders_service_types_pickup",
  DELIVERY: "orders_service_types_delivery",
  YANDEX_DELIVERY: "orders_service_types_yandex_delivery",
  NOOR_DELIVERY: "orders_service_types_noor_delivery",
};

export const SectionLabel = ({
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

export const InfoRow = ({
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

type OrderDetailSectionsProps = {
  detail: OrderDetail;
};

const OrderDetailSections = ({ detail }: OrderDetailSectionsProps) => {
  const t = useTranslations();
  const [mapOpen, setMapOpen] = useState(false);
  const [routeMapOpen, setRouteMapOpen] = useState(false);
  const { data: general } = useGeneral();
  const isDelivery = DELIVERY_TYPES.includes(detail.service_type);
  const displayAddress = isDelivery ? detail.address : detail.branch.address;

  const { data: branches } = useBranches();
  const mapBranch =
    branches?.data.find((item) => item.id === detail.branch.id) ?? null;

  return (
    <Fragment>
      <div className="flex flex-col divide-y divide-gray180 px-4">
        <section className="py-5">
          <StatusTimeline status={detail.status.status} />
        </section>

        <section className="py-5">
          <SectionLabel
            icon={isDelivery ? <IconMapPinFilled size={13} /> : <Footprints size={13} />}
          >
            {isDelivery
              ? t("orders_detail_delivery_address")
              : t("orders_detail_pickup_address")}
          </SectionLabel>
          {isDelivery ? (
            <button
              type="button"
              disabled={!mapBranch}
              onClick={() => setRouteMapOpen(true)}
              className="mt-3 flex w-full items-center gap-3 text-left disabled:pointer-events-none"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray10 text-gray220">
                <IconMapPinFilled size={18} />
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
                <IconMapPinFilled size={18} />
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
                <IconMapPinFilled size={18} />
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
          <SectionLabel icon={<IconToolsKitchen2Filled size={13} />}>
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

        <PaymentSection detail={detail} isDelivery={isDelivery} />
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

export { OrderDetailSections };

export default OrderDetailSections;
