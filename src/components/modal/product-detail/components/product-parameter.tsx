import { Check, Loader2, Minus, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { formatPrice } from "@/utils/format-price";
import type { ProductParameterProps } from "@/types/product";
import { getSkuMeta } from "@/components/modal/product-detail/product-detail";
import { IconShoppingCartFilled } from "@tabler/icons-react";

type ProductParameterPropsType = {
  parameter: ProductParameterProps;
  selectedSkuIds: number[];
  onSelect: (skuId: number) => void;
  pricePrefix?: string;
  multiple?: boolean;
  variant?: "default" | "parameterChip";
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
  const t = useTranslations();

  if (!parameter.skus?.length) return null;

  if (variant === "parameterChip") {
    return (
      <div className="space-y-3">
        <p className="text-base font-medium leading-5 text-black">
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
                        {formatPrice(sku.price)} {t("sum")}
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
      <p className="mb-3 text-base font-medium leading-5 text-black">
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
                  <span className="info-label block truncate">
                    {sku.name}
                  </span>
                  {meta && (
                    <span className="info-value block">
                      {meta}
                    </span>
                  )}
                </span>
              </span>

              {typeof sku.price === "number" && (
                <span className="shrink-0 text-sm font-medium leading-5 text-gray200">
                  {pricePrefix}
                  {formatPrice(sku.price)} {t("sum")}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

type ProductDetailFooterProps = {
  quantity: number;
  totalPrice: string;
  sumLabel: string;
  hasCart: boolean;
  isLoading: boolean;
  onAdd: () => void;
  onAddAndClose: () => void;
  onDecrement: () => void;
  onChangeQuantity: (value: string) => void;
};

const ProductDetailFooter = ({
  quantity,
  totalPrice,
  sumLabel,
  hasCart,
  isLoading,
  onAdd,
  onAddAndClose,
  onDecrement,
  onChangeQuantity,
}: ProductDetailFooterProps) => {
  const t = useTranslations();
  return (
    <div className="absolute bottom-0 left-0 right-0 border-t border-gray180 bg-white px-5 pb-[max(14px,env(safe-area-inset-bottom))] pt-3 lg:px-6 lg:pb-5 lg:pt-4">
      <div className="flex items-center gap-3 lg:gap-4">
        <div className="h-12 w-[122px] shrink-0 lg:h-13 lg:w-[138px]">
          <div className="flex h-full items-center justify-between rounded-2xl border border-gray180 bg-white p-1 text-black">
            <button
              type="button"
              onClick={onDecrement}
              disabled={isLoading || !hasCart}
              className="grid h-10 w-10 place-items-center rounded-xl bg-gray10 text-black disabled:opacity-50"
            >
              <Minus size={16} strokeWidth={2.5} />
            </button>
            {isLoading ? (
              <span className="grid h-10 w-9 place-items-center">
                <Loader2 size={16} className="animate-spin text-primary" />
              </span>
            ) : (
              <input
                value={quantity || 1}
                onChange={(event) => onChangeQuantity(event.target.value)}
                inputMode="numeric"
                maxLength={3}
                pattern="[0-9]*"
                className="h-10 w-9 bg-transparent text-center text-base font-medium text-black outline-none"
              />
            )}
            <button
              type="button"
              onClick={onAdd}
              disabled={isLoading || (quantity || 1) >= 999}
              className="grid h-10 w-10 place-items-center rounded-xl bg-gray10 text-black disabled:opacity-50"
            >
              <Plus size={16} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={onAddAndClose}
          disabled={isLoading}
          className="flex h-12 min-w-0 flex-1 items-center justify-between gap-3 rounded-2xl bg-primary px-5 text-white shadow-[0_10px_24px_rgba(107,83,230,0.28)] disabled:opacity-70 lg:h-13 lg:px-6"
        >
          <span className="flex items-center gap-2 text-sm font-medium">
            <IconShoppingCartFilled size={18} />
            {t("add_to_cart")}
          </span>
          <span className="text-sm font-medium">
            {totalPrice} {sumLabel}
          </span>
        </button>
      </div>
    </div>
  );
};

export { ProductParameter, ProductDetailFooter };

export default ProductParameter;
