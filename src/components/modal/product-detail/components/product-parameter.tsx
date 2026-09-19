import { Check } from "lucide-react";

import { formatPrice } from "@/utils/format-price";
import type { ProductParameterProps } from "@/types/product";

import { getSkuMeta } from "../utils";

type ProductParameterPropsType = {
  parameter: ProductParameterProps;
  selectedSkuIds: number[];
  onSelect: (skuId: number) => void;
  pricePrefix?: string;
  multiple?: boolean;
  variant?: "default" | "parametrChip";
  error?: boolean;
};

const ProductParameter = ({
  parameter,
  selectedSkuIds,
  onSelect,
  pricePrefix,
  multiple = false,
  variant = "default",
  error = false,
}: ProductParameterPropsType) => {
  if (!parameter.skus?.length) return null;

  if (variant === "parametrChip") {
    return (
      <div className="space-y-3">
        <p className="text-base font-bold leading-5 text-black">
          {parameter.name}
        </p>

        <div className="grid grid-cols-2 gap-2.5">
          {parameter.skus.map((sku) => {
            const isSelected = selectedSkuIds.includes(sku.id);

            return (
              <button
                key={sku.id}
                type="button"
                onClick={() => onSelect(sku.id)}
                className={`min-h-[58px] min-w-0 rounded-xl border px-3 py-2 text-left shadow-sm transition-colors ${
                  isSelected
                    ? "border-green-500 bg-green-50 shadow-green-500/10"
                    : error
                      ? "required-option-error border-red-400 bg-white shadow-none hover:border-red-500"
                      : "border-gray180 bg-white shadow-black/[0.03] hover:border-gray220"
                }`}
              >
                <span className="flex h-full items-start gap-2.5">
                  <span
                    className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center border transition-colors ${
                      multiple ? "rounded-md" : "rounded-full"
                    } ${
                      isSelected
                        ? multiple
                          ? "border-green-500 bg-green-500"
                          : "border-green-500 bg-white"
                        : error
                          ? "border-red-400 bg-white"
                          : "border-gray180 bg-white"
                    }`}
                  >
                    {isSelected ? (
                      multiple ? (
                        <Check size={14} strokeWidth={3} className="text-white" />
                      ) : (
                        <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
                      )
                    ) : null}
                  </span>

                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="line-clamp-2 text-sm font-medium leading-5 text-black">
                      {sku.name}
                    </span>
                    {typeof sku.price === "number" && (
                      <span className="mt-auto pt-1 text-xs font-medium leading-4 text-gray220">
                        {pricePrefix}
                        {formatPrice(sku.price)} UZS
                      </span>
                    )}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div>
      <p className="mb-3 text-base font-bold leading-5 text-black">
        {parameter.name}
      </p>

      <div className="space-y-1">
        {parameter.skus.map((sku) => {
          const meta = getSkuMeta(sku);
          const isSelected = selectedSkuIds.includes(sku.id);

          return (
            <button
              key={sku.id}
              type="button"
              onClick={() => onSelect(sku.id)}
              className={`flex min-h-10 w-full items-center justify-between gap-3 rounded-xl border px-2 py-1.5 text-left transition-colors ${
                error && !isSelected
                  ? "required-option-error border-red-400 hover:border-red-500"
                  : "border-transparent hover:border-gray180"
              }`}
            >
              <span className="flex min-w-0 items-center gap-3">
                <span
                  className={`grid h-5 w-5 shrink-0 place-items-center border transition-colors ${
                    multiple ? "rounded-md" : "rounded-full"
                  } ${
                    isSelected
                      ? multiple
                        ? "border-green-500 bg-green-500"
                        : "border-green-500"
                      : error
                        ? "border-red-400"
                        : "border-gray180"
                  }`}
                >
                  {isSelected ? (
                    multiple ? (
                      <Check size={14} strokeWidth={3} className="text-white" />
                    ) : (
                      <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
                    )
                  ) : null}
                </span>

                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium leading-5 text-black">
                    {sku.name}
                  </span>
                  {meta && (
                    <span className="block text-xs font-medium leading-4 text-gray220">
                      {meta}
                    </span>
                  )}
                </span>
              </span>

              {typeof sku.price === "number" && (
                <span className="shrink-0 text-sm font-medium leading-5 text-gray200">
                  {pricePrefix}
                  {formatPrice(sku.price)} UZS
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ProductParameter;
