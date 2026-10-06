"use client";

import type { GeneralProps } from "@/types/general";
import type { DeliveryType, OrderFormValues } from "@/types/order";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import { useTranslations } from "next-intl";
import { isPickupType } from "@/constants/delivery-type";
import type { BranchProps } from "@/types/branch";
import { RadioMark, getOptionClassName } from "@/components/ui/radio-mark";
import Branches from "@/app/order/components/branches/index";

type OrderOptionProps = {
  label: string;
  desc: string;
};

export const ORDER_OPTIONS: Record<Lowercase<DeliveryType>, OrderOptionProps> = {
  pickup: {
    label: "order_page_delivery_type_options_pickup_label",
    desc: "order_page_delivery_type_options_pickup_desc",
  },
  delivery: {
    label: "order_page_delivery_type_options_delivery_label",
    desc: "order_page_delivery_type_options_delivery_desc",
  },
  bts_pickup: {
    label: "order_page_delivery_type_options_bts_pickup_label",
    desc: "order_page_delivery_type_options_bts_pickup_desc",
  },
  yandex_delivery: {
    label: "order_page_delivery_type_options_yandex_delivery_label",
    desc: "order_page_delivery_type_options_yandex_delivery_desc",
  },
  noor_delivery: {
    label: "order_page_delivery_type_options_noor_delivery_label",
    desc: "order_page_delivery_type_options_noor_delivery_desc",
  },
};

export const getOrderOption = (type: DeliveryType) =>
  ORDER_OPTIONS[type.toLowerCase() as Lowercase<DeliveryType>];

export const getAvailableServices = (services: GeneralProps["services"]) =>
  services?.filter(
    (service) =>
      service.is_active && service.type.toLowerCase() in ORDER_OPTIONS,
  ) ?? [];

type DeliveryTypeDeliveryTypeProps = {
  services: NonNullable<GeneralProps["services"]>;
  branches?: BranchProps[];
  isBranchesLoading: boolean;
  isBranchesError: boolean;
  isServicesLoading: boolean;
  workingTime?: GeneralProps["working_time"];
};

const DeliveryTypeDeliveryType = ({
  services,
  branches,
  isBranchesLoading,
  isBranchesError,
  isServicesLoading,
  workingTime,
}: DeliveryTypeDeliveryTypeProps) => {
  const t = useTranslations();
  const {
    control,
    formState: { errors },
  } = useFormContext<OrderFormValues>();
  const deliveryType = useWatch({ control, name: "delivery_type" });
  const selectedBranchId = useWatch({ control, name: "branch" });

  return (
    <>
      <section className="rounded-xl bg-white p-3">
        <h2 className="pb-2 text-sm font-medium text-black">
          {t("order_page_delivery_type_title")}
        </h2>
        {isServicesLoading ? (
          <div className="flex flex-col gap-2 lg:grid lg:grid-cols-2">
            {Array.from({ length: 2 }).map((_, index) => (
              <div key={index} className="skeleton h-16 rounded-lg" />
            ))}
          </div>
        ) : services.length === 0 ? (
          <p className="text-xs font-normal text-gray220">
            {t("order_page_delivery_type_empty")}
          </p>
        ) : (
          <Controller
            control={control}
            name="delivery_type"
            render={({ field }) => (
              <div className="flex flex-col gap-2 lg:grid lg:grid-cols-2">
                {services.map((service) => {
                  const option = getOrderOption(service.type);
                  const checked = field.value === service.type;

                  return (
                    <button
                      key={service.id}
                      type="button"
                      onClick={() => field.onChange(service.type)}
                      className={`flex min-h-16 w-full items-center justify-between gap-3 rounded-2xl px-3 py-2.5 text-left ${getOptionClassName(checked, false, "outlined")}`}
                    >
                      <span className="min-w-0">
                        <span className="info-label block">
                          {t(option.label)}
                        </span>
                        <span className="info-value block">
                          {t(option.desc)}
                        </span>
                      </span>
                      <RadioMark checked={checked} />
                    </button>
                  );
                })}
              </div>
            )}
          />
        )}
        {errors.delivery_type && (
          <span className="px-1 text-xs text-red">
            {errors.delivery_type.message}
          </span>
        )}
      </section>

      {isPickupType(deliveryType) && (
        <Branches
          branches={branches}
          isLoading={isBranchesLoading}
          isError={isBranchesError}
          workingTime={workingTime}
          value={selectedBranchId ?? null}
          error={errors.branch?.message}
        />
      )}
    </>
  );
};

export { DeliveryTypeDeliveryType };

export default DeliveryTypeDeliveryType;
