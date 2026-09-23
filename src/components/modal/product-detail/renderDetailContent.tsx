"use client";

import { formatPrice } from "@/utils/format-price";
import { ProductDetailSkeleton } from "@/components/ui/skeleton";
import { ProductDetailMedia, ProductParameter } from "./components";
import type { ProductDetailActionContext } from "./createCartActions";
import type { createCartActions } from "./createCartActions";

export type ProductDetailRenderContext = ProductDetailActionContext &
  ReturnType<typeof createCartActions> & {
    dragCloseOffset: number;
    isCenterDesktop: boolean;
    isRightDrawerDesktop: boolean;
  };

// The mobile sheet / centered dialog body: media, info, parameters.
export const renderDetailContent = (ctx: ProductDetailRenderContext) => {
  const {
    t,
    productDetailVariant,
    setPhotoState,
    isExpanded,
    contentScrollRef,
    requiredParameterRef,
    data,
    isLoading,
    detail,
    photos,
    activePhotoIndex,
    image,
    description,
    unit,
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
    handleChooseAnotherBranch,
    handleSelectParameter,
    handleSelectAdditionalParameter,
    isCenterDesktop,
  } = ctx;

  return (
    <div
      ref={contentScrollRef}
      className={`scroll-hidden relative overflow-y-auto bg-white pb-[112px] ${
        isCenterDesktop
          ? "max-h-[calc(100vh-48px)] rounded-[24px] lg:pb-[108px]"
          : `min-h-0 flex-auto lg:h-full lg:rounded-none lg:pb-[126px] ${
              isExpanded ? "rounded-none" : "rounded-t-[28px]"
            }`
      }`}
    >
      {isLoading ? (
        <ProductDetailSkeleton />
      ) : (
        <>
          <ProductDetailMedia
            image={image}
            name={detail.name}
            photos={photos}
            activePhotoIndex={activePhotoIndex}
            hasDiscount={hasDiscount && Boolean(detail.sale_amount)}
            saleLabel={saleLabel}
            saleBadgeClassName={saleBadgeClassName}
            onSelectPhoto={(index) =>
              setPhotoState({
                productId: detail.id,
                index,
              })
            }
          />
          <div className="px-5 pt-4 lg:px-6 lg:pt-5">
            {detail.category?.name && (
              <span className="inline-flex rounded-lg bg-gray10 px-3 py-1 text-xs font-medium text-black lg:rounded-xl lg:px-3.5 lg:py-1.5">
                {detail.category.name}
              </span>
            )}

            <div className="mt-3 flex items-start justify-between gap-4">
              <h2 className="min-w-0 flex-1 text-lg font-medium leading-6 text-black lg:text-[22px] lg:leading-7">
                {detail.name}
              </h2>

              {detail.amount > 0 && (
                <span className="shrink-0 rounded-full bg-gray10 px-3 py-1.5 text-xs font-medium text-gray220">
                  {detail.amount} {unit ?? t("product_gram_unit")}
                </span>
              )}
            </div>

            <div className="mt-3 flex items-center gap-2">
              <p className="text-[22px] font-medium leading-7 text-black lg:text-[26px] lg:leading-8">
                {formatPrice(price)} {t("sum")}
              </p>
              {oldPrice && (
                <p className="text-sm font-medium leading-none text-red-500 line-through">
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
                  className="mt-1 text-sm font-medium text-black underline-offset-2 hover:underline"
                >
                  {t("product_choose_other_branch")}
                </button>
              </div>
            )}

            {description && (
              <p className="mt-4 text-sm leading-5 text-gray220 lg:mt-5 lg:text-[15px] lg:leading-6">
                {description}
              </p>
            )}

            {hasParameters && (
              <div className="mt-5 space-y-3">
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
                    selectedSkuIds={
                      selectedAdditionalSkuIds[parameter.id] ?? []
                    }
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
          </div>
        </>
      )}
    </div>
  );
};
