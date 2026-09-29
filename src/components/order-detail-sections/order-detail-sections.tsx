"use client";

import { Fragment, useState } from "react";
import { ChevronRight, Footprints } from "lucide-react";
import { IconMapPinFilled, IconToolsKitchen2Filled } from "@tabler/icons-react";

import { useTranslations } from "next-intl";

import { useGeneral } from "@/hooks/useGeneral";
import { getShortAddress } from "@/utils/address";
import { formatPrice } from "@/utils/format-price";
import { IMAGE_PLACEHOLDER_SRC, handleImageFallback } from "@/utils/image";
import type { OrderDetail } from "@/types/order";

import BranchInfoSheet from "@/components/branch-info-sheet";
import DeliveryRouteSheet from "@/components/delivery-route-sheet";
import StatusTimeline from "@/components/status-timeline";
import { useBranches } from "@/hooks/useBranches";

import { DELIVERY_TYPES } from "./constants";
import { SectionLabel } from "./parts";
import PaymentSection from "./payment-section";

type OrderDetailSectionsProps = {
  detail: OrderDetail;
};

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
  const { data: general } = useGeneral();
  const isDelivery = DELIVERY_TYPES.includes(detail.service_type);
  const displayAddress = isDelivery ? detail.address : detail.branch.address;

  // Same queryKey as src/app/[page]/components/branch-selection's
  // useBranchSelection — the full branch list (with lat/lng), so this shares
  // its cache instead of refetching. detail.branch only carries
  // id/name/address, not coordinates — needed for both cases now: the
  // pickup branch-info sheet, and the delivery route sheet's "ships from"
  // point.
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

export default OrderDetailSections;
