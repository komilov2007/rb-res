"use client";

import { Controller, useFormContext, useWatch } from "react-hook-form";
import { useTranslations } from "next-intl";

import { isPickupType } from "@/constants/delivery-type";
import type { BranchProps } from "@/types/branch";
import type { GeneralProps } from "@/types/general";
import type { OrderFormValues } from "@/types/order";
import RadioMark from "@/components/ui/radio-mark";

import Branches from "../branches";
import { getOrderOption } from "./constants";

type DeliveryTypeProps = {
  // Already filtered to active services known to ORDER_OPTIONS.
  services: NonNullable<GeneralProps["services"]>;
  branches?: BranchProps[];
  isBranchesLoading: boolean;
  isBranchesError: boolean;
  workingTime?: GeneralProps["working_time"];
};

const DeliveryType = ({
  services,
  branches,
  isBranchesLoading,
  isBranchesError,
  workingTime,
}: DeliveryTypeProps) => {
  const t = useTranslations();
  const {
    control,
    formState: { errors },
  } = useFormContext<OrderFormValues>();
  const deliveryType = useWatch({ control, name: "delivery_type" });
  const selectedBranchId = useWatch({ control, name: "branch" });

  return (
    <>
      <section className="rounded-2xl bg-white p-4">
        <h2 className="pb-2 text-sm font-bold text-black">
          {t("order_page_delivery_type_title")}
        </h2>
        {services.length === 0 ? (
          <p className="text-xs font-medium text-gray220">
            {t("order_page_delivery_type_empty")}
          </p>
        ) : (
          <Controller
            control={control}
            name="delivery_type"
            render={({ field }) => (
              <div className="flex flex-col gap-2">
                {services.map((service) => {
                  const option = getOrderOption(service.type);
                  const checked = field.value === service.type;

                  return (
                    <button
                      key={service.id}
                      type="button"
                      onClick={() => field.onChange(service.type)}
                      className={`flex w-full items-center justify-between gap-3 rounded-xl border px-2 py-3 text-left ${
                        checked
                          ? "border-green-500 bg-green-500/10"
                          : "border-transparent bg-gray10/50"
                      }`}
                    >
                      <span className="min-w-0">
                        <span className="block text-sm font-normal text-black">
                          {t(option.label)}
                        </span>
                        <span className="mt-0.5 block text-xs font-medium text-gray220">
                          {t(option.desc)}
                        </span>
                      </span>
                      <RadioMark checked={checked} size="sm" />
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

export default DeliveryType;
