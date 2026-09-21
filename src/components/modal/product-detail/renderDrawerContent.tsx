"use client";

import { Tag } from "lucide-react";
import XButton from "@/components/ui/x-button";
import { formatPrice } from "@/utils/format-price";
import { getImageSrc, handleImageFallback } from "@/utils/image";
import { ProductDetailSkeleton } from "@/components/ui/skeleton";
import { ProductParameter } from "./components";
import type { ProductDetailActionContext } from "./createCartActions";
import type { createCartActions } from "./createCartActions";

export type ProductDetailRenderContext = ProductDetailActionContext &
  ReturnType<typeof createCartActions> & {
    dragCloseOffset: number;
    isCenterDesktop: boolean;
    isRightDrawerDesktop: boolean;
  };

// The desktop right-drawer body.
export const renderDrawerContent = (ctx: ProductDetailRenderContext) => {
  const {
    t,
    productDetailVariant,
    setPhotoState,
    requiredParameterRef,
    data,
    isLoading,
    detail,
    photos,
    activePhotoIndex,
    image,
    description,
    selectedParameterSkuId,
    selectedAdditionalSkuIds,
    price,
    oldPrice,
    showParameterError,
    hasDiscount,
    isUnavailableInBranch,
    hasParameters,
    saleLabel,
    saleBadgeClassName,
    closeDetail,
    handleChooseAnotherBranch,
    handleSelectParameter,
    handleSelectAdditionalParameter,
  } = ctx;

  return (
    <div className="scroll-hidden relative h-full overflow-y-auto bg-white pb-[126px]">
      {isLoading ? (
        <ProductDetailSkeleton />
      ) : (
        <>
          <div className="sticky top-0 z-30 flex h-[68px] items-center justify-between border-b border-gray180 bg-white px-6">
            {detail.category?.name ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-200 bg-orange-50 px-3.5 py-1.5 text-sm font-bold text-orange-600">
                <Tag size={15} strokeWidth={2.4} />
                {detail.category.name}
              </span>
            ) : (
              <span />
            )}
            <XButton
              size="lg"
              onClick={closeDetail}
              className="bg-transparent text-gray220 hover:bg-gray10 hover:text-black"
            />
          </div>

          <div className="px-6 pt-5">
            <div className="relative overflow-hidden rounded-2xl bg-gray10">
              <img
                src={image}
                alt={detail.name}
                onError={handleImageFallback}
                className="h-[340px] w-full object-cover"
              />
              {hasDiscount && Boolean(detail.sale_amount) && (
                <span
                  className={`absolute left-4 top-4 rounded-lg px-3 py-2 text-xs font-extrabold uppercase leading-none text-white ${saleBadgeClassName}`}
                >
                  {t("product_sale_label", { label: saleLabel })}
                </span>
              )}
            </div>

            {photos.length > 1 && (
              <div className="scroll-hidden mt-4 flex gap-2 overflow-x-auto">
                {photos.map((photo, index) => (
                  <button
                    key={`${photo}-${index}`}
                    type="button"
                    onClick={() =>
                      setPhotoState({
                        productId: detail.id,
                        index,
                      })
                    }
                    className={`h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 bg-gray10 ${
                      activePhotoIndex === index
                        ? "border-primary"
                        : "border-transparent"
                    }`}
                  >
                    <img
                      src={getImageSrc(photo)}
                      alt={`${detail.name} ${index + 1}`}
                      onError={handleImageFallback}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            <div className="mt-7">
              <h2 className="text-[26px] font-extrabold leading-8 text-black">
                {detail.name}
              </h2>
              <div className="mt-3 flex items-end gap-2">
                <p className="text-[34px] font-extrabold leading-none text-black">
                  {formatPrice(price)} {t("sum")}
                </p>
                {oldPrice && (
                  <p className="pb-1 text-base font-medium leading-none text-gray220 line-through">
                    {formatPrice(oldPrice)} {t("sum")}
                  </p>
                )}
              </div>
              {isUnavailableInBranch && (
                <div className="mt-3 rounded-xl bg-red-50 px-3 py-2">
                  <p className="text-sm font-medium text-red-500">
                    {t("product_unavailable")}
                  </p>
                  <button
                    type="button"
                    onClick={handleChooseAnotherBranch}
                    className="mt-1 text-sm font-bold text-black underline-offset-2 hover:underline"
                  >
                    {t("product_choose_other_branch")}
                  </button>
                </div>
              )}
            </div>

            {hasParameters && (
              <div className="mt-6 space-y-3 border-t border-gray180 pt-5">
                {data?.data.parameter?.skus?.length ? (
                  <div ref={requiredParameterRef}>
                    <ProductParameter
                      parameter={data.data.parameter}
                      selectedSkuIds={
                        selectedParameterSkuId ? [selectedParameterSkuId] : []
                      }
                      onSelect={handleSelectParameter}
                      variant={productDetailVariant}
                      error={showParameterError && !selectedParameterSkuId}
                    />
                  </div>
                ) : null}

                {data?.data.additional_parameter?.map((parameter) => (
                  <ProductParameter
                    key={parameter.id}
                    parameter={parameter}
                    selectedSkuIds={selectedAdditionalSkuIds[parameter.id] ?? []}
                    onSelect={(skuId) =>
                      handleSelectAdditionalParameter(parameter, skuId)
                    }
                    pricePrefix="+ "
                    multiple={parameter.type !== "single"}
                    variant={productDetailVariant}
                  />
                ))}
              </div>
            )}

            {description && (
              <div className="mt-6 border-t border-gray180 pt-5">
                <h3 className="text-xs font-bold uppercase tracking-wide text-gray220">
                  {t("product_description")}
                </h3>
                <p className="mt-3 text-[15px] leading-6 text-gray220">
                  {description}
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
