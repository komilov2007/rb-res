"use client";

import { Tag } from "lucide-react";
import { getProductDetail } from "@/apis/products";
import { getCartList, postCart } from "@/apis/cart";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import XButton from "@/components/ui/x-button";
import { useProductBranchPickerStore } from "@/stores/product-branch-picker";
import { useProductDetailStore } from "@/stores/product-detail";
import { useCartStore } from "@/stores/cart";
import { formatPrice } from "@/utils/format-price";
import {
  getImageSrc,
  handleImageFallback,
  IMAGE_PLACEHOLDER_SRC,
} from "@/utils/image";
import { useTranslations } from "next-intl";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { ProductDetailSkeleton } from "@/components/ui/skleton";
import type { ProductParameterProps } from "@/types/product";
import { useAuthStore } from "@/stores/auth";
import { normalizeCartItems } from "@/utils/cart";
import {
  ProductDetailFooter,
  ProductDetailMedia,
  ProductParameter,
} from "./components";
import { getOldPrice, stripHtml } from "./utils";
import { useBranchSelection } from "@/app/[page]/components/branch-selection";
import { showProductUnavailable } from "@/utils/branch-availability";

const ProductDetailMobile = () => {
  const t = useTranslations();
  const product = useProductDetailStore((state) => state.product);
  const isOpen = useProductDetailStore((state) => state.isOpen);
  const closeProductDetail = useProductDetailStore(
    (state) => state.closeProductDetail,
  );
  const saleBadgeVariant = useProductDetailStore(
    (state) => state.saleBadgeVariant,
  );
  const productDetailVariant = useProductDetailStore((state) => state.variant);
  const desktopVariant = useProductDetailStore((state) => state.desktopVariant);
  const carts = useCartStore((state) => state.carts);
  const setCarts = useCartStore((state) => state.setCarts);
  const customerId = useAuthStore((state) => state.auth?.customer);
  const setLoginModal = useAuthStore((state) => state.setLoginModal);
  const { branchId: selectedBranchId } = useBranchSelection();
  const openProductBranchPicker = useProductBranchPickerStore(
    (state) => state.openProductBranchPicker,
  );
  const queryClient = useQueryClient();
  const [photoState, setPhotoState] = useState<{
    productId: number | null;
    index: number;
  }>({
    productId: null,
    index: 0,
  });
  const [skuState, setSkuState] = useState<{
    productId: number | null;
    parameterSkuId?: number;
    additionalSkuIds: Record<number, number[]>;
  }>({
    productId: null,
    additionalSkuIds: {},
  });
  const [parameterErrorState, setParameterErrorState] = useState<{
    productId: number | null;
    show: boolean;
  }>({
    productId: null,
    show: false,
  });
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartYRef = useRef<number | null>(null);
  // Expanding to full screen is only allowed when content overflows the
  // content-fitted sheet; otherwise it would just add empty space.
  const canExpandRef = useRef(false);
  const contentScrollRef = useRef<HTMLDivElement | null>(null);
  const requiredParameterRef = useRef<HTMLDivElement | null>(null);
  const [dragDeltaY, setDragDeltaY] = useState(0);
  const [dragStartHeight, setDragStartHeight] = useState(0);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px)");
    const updateDesktop = () => setIsDesktop(media.matches);

    updateDesktop();
    media.addEventListener("change", updateDesktop);

    return () => media.removeEventListener("change", updateDesktop);
  }, []);

  const { data, isLoading } = useQuery({
    enabled: isOpen && Boolean(product?.id),
    queryKey: ["product-detail", product?.id],
    queryFn: () => getProductDetail(product!.id),
  });
  const stockMutation = useMutation({
    mutationFn: ({
      customerId,
      data,
    }: {
      customerId: number | string;
      data: Parameters<typeof postCart>[1];
    }) => postCart(customerId, data),
  });

  if (!product) return null;

  const detail = data?.data ?? product;
  const photos = data?.data.photos?.length
    ? data.data.photos
        .map((item) => item.photo)
        .filter((photo): photo is string => Boolean(photo))
    : [detail.photo].filter((photo): photo is string => Boolean(photo));
  const activePhotoIndex =
    photoState.productId === detail.id ? photoState.index : 0;
  const image = photos[activePhotoIndex] || photos[0] || IMAGE_PLACEHOLDER_SRC;
  const description = stripHtml(data?.data.desc || detail.description);
  const unit = data?.data.unit?.unit || data?.data.unit?.name;
  const selectedParameterSkuId =
    skuState.productId === detail.id ? skuState.parameterSkuId : undefined;
  const selectedParameterSku = data?.data.parameter?.skus?.find(
    (sku) => sku.id === selectedParameterSkuId,
  );
  const hasRequiredParameter = Boolean(data?.data.parameter?.skus?.length);
  const selectedAdditionalSkuIds =
    skuState.productId === detail.id ? skuState.additionalSkuIds : {};
  const selectedAdditionalSkus =
    data?.data.additional_parameter?.flatMap((parameter) =>
      parameter.skus.filter((sku) =>
        selectedAdditionalSkuIds[parameter.id]?.includes(sku.id),
      ),
    ) ?? [];
  const price = detail.discount_price ?? detail.price;
  const selectedParameterPrice = selectedParameterSku?.price ?? 0;
  const selectedAdditionalPrice = selectedAdditionalSkus.reduce(
    (total, sku) => total + (sku.price ?? 0),
    0,
  );
  const totalItemPrice =
    price + selectedParameterPrice + selectedAdditionalPrice;
  const oldPrice = getOldPrice({
    price: detail.price,
    discountPrice: detail.discount_price,
    saleAmount: detail.sale_amount,
    saleType: detail.sale_type,
  });
  const cartItem = carts.find((item) => item.product.id === detail.id);
  const quantity = cartItem?.quantity ?? 0;
  const totalPrice = totalItemPrice * (quantity || 1);
  const branchId = detail.branches?.[0];
  const isStockLoading = stockMutation.isPending;
  const showParameterError =
    parameterErrorState.productId === detail.id && parameterErrorState.show;
  const hasDiscount = Boolean(detail.discount_price || detail.sale_amount);
  // Not sold at the branch selected on home — adding is blocked.
  const isUnavailableInBranch =
    selectedBranchId !== null && !detail.branches?.includes(selectedBranchId);
  const hasParameters = Boolean(
    data?.data.parameter?.skus?.length ||
    data?.data.additional_parameter?.some((item) => item.skus?.length),
  );
  const saleLabel =
    detail.sale_type === "PERCENT"
      ? `-${detail.sale_amount}%`
      : `-${formatPrice(detail.sale_amount ?? 0)} ${t("sum")}`;
  const saleBadgeClassName = {
    primary: "bg-primary",
    green: "bg-green-500",
    red: "bg-red-500",
    orange: "bg-orange-500",
  }[saleBadgeVariant ?? "orange"];

  const resetSelection = () => {
    setSkuState({
      productId: null,
      additionalSkuIds: {},
    });
    setParameterErrorState({
      productId: null,
      show: false,
    });
  };

  const closeDetail = () => {
    resetSelection();
    setIsExpanded(false);
    setIsDragging(false);
    setDragDeltaY(0);
    closeProductDetail();
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) closeDetail();
  };

  // Closes this detail view first — the branch picker is a full-screen
  // overlay of its own (same as the header's "Xaritadan tanlash"), so
  // stacking it on top of this one too is just visual clutter, not useful.
  const handleChooseAnotherBranch = () => {
    openProductBranchPicker(detail);
    closeDetail();
  };

  const handleDragStart = (clientY: number, sheetHeight: number) => {
    const scroller = contentScrollRef.current;

    dragStartYRef.current = clientY;
    canExpandRef.current = Boolean(
      scroller && scroller.scrollHeight > scroller.clientHeight,
    );
    setDragStartHeight(sheetHeight);
    setIsDragging(true);
    setDragDeltaY(0);
  };

  const handleDragMove = (clientY: number) => {
    if (dragStartYRef.current === null) return;

    const nextDeltaY = clientY - dragStartYRef.current;
    setDragDeltaY(canExpandRef.current ? nextDeltaY : Math.max(nextDeltaY, 0));
  };

  const handleDragEnd = (clientY: number) => {
    if (dragStartYRef.current === null) return;

    const diffY = dragStartYRef.current - clientY;

    if (diffY > 36 && canExpandRef.current) {
      setIsExpanded(true);
    } else if (diffY < -36) {
      // Collapsing / closing is always allowed.
      if (isExpanded) {
        setIsExpanded(false);
      } else {
        closeDetail();
      }
    }

    dragStartYRef.current = null;
    setIsDragging(false);
    setDragDeltaY(0);
  };

  const refreshCartList = async () => {
    if (!customerId) return;

    const cartListResponse = await queryClient.fetchQuery({
      queryKey: ["cart-list", customerId],
      queryFn: () => getCartList(customerId),
      staleTime: 0,
    });

    setCarts(
      normalizeCartItems(cartListResponse.data, useCartStore.getState().carts),
    );
    await queryClient.invalidateQueries({
      queryKey: ["cart-list", customerId],
    });
  };

  const syncParametrCart = async (nextQuantity: number) => {
    if (!customerId) return;

    await stockMutation.mutateAsync({
      customerId,
      data: {
        product: detail.id,
        quantity: nextQuantity,
        parameter: selectedParameterSkuId,
        ad_parameter: selectedAdditionalSkus.map((sku) => sku.id),
        branch_id: branchId ? String(branchId) : undefined,
      },
    });

    void refreshCartList();
  };

  const handleChangeQuantity = async (value: string) => {
    const quantityValue = Number(value.replace(/\D/g, "").slice(0, 3));

    if (!quantityValue || quantityValue < 1) return;
    if (isUnavailableInBranch) {
      showProductUnavailable();
      return;
    }
    if (!validateRequiredParameter()) return;

    await syncParametrCart(quantityValue);
  };

  const handleSelectParameter = (skuId: number) => {
    setParameterErrorState({
      productId: detail.id,
      show: false,
    });
    setSkuState((state) => ({
      productId: detail.id,
      parameterSkuId: skuId,
      additionalSkuIds:
        state.productId === detail.id ? state.additionalSkuIds : {},
    }));
  };

  const handleSelectAdditionalParameter = (
    parameter: ProductParameterProps,
    skuId: number,
  ) => {
    const isSingle = parameter.type === "single";

    setSkuState((state) => {
      const currentAdditionalSkuIds =
        state.productId === detail.id ? state.additionalSkuIds : {};
      const currentSelectedSkuIds = currentAdditionalSkuIds[parameter.id] ?? [];
      const nextSelectedSkuIds = isSingle
        ? [skuId]
        : currentSelectedSkuIds.includes(skuId)
          ? currentSelectedSkuIds.filter((id) => id !== skuId)
          : [...currentSelectedSkuIds, skuId];

      return {
        productId: detail.id,
        parameterSkuId:
          state.productId === detail.id ? state.parameterSkuId : undefined,
        additionalSkuIds: {
          ...currentAdditionalSkuIds,
          [parameter.id]: nextSelectedSkuIds,
        },
      };
    });
  };

  const validateRequiredParameter = () => {
    if (!hasRequiredParameter || selectedParameterSkuId) return true;

    setParameterErrorState({
      productId: detail.id,
      show: true,
    });
    requiredParameterRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
    return false;
  };

  const handleAdd = async () => {
    // Adding to the cart requires login. The drawer is closed first — the
    // login modal stacked on top of this open Sheet wasn't usable.
    if (!customerId) {
      closeDetail();
      setLoginModal(true)();
      return false;
    }

    if (isUnavailableInBranch) {
      showProductUnavailable();
      return false;
    }

    if (!validateRequiredParameter()) return false;

    const nextQuantity = cartItem ? quantity + 1 : 1;
    await syncParametrCart(nextQuantity);

    return true;
  };

  const handleDecrementDetail = async () => {
    if (!cartItem) return;

    if (!customerId) {
      setCarts(
        carts
          .map((item) =>
            item.product.id === detail.id
              ? { ...item, quantity: Math.max(item.quantity - 1, 0) }
              : item,
          )
          .filter((item) => item.quantity > 0),
      );
      return;
    }

    const nextQuantity = Math.max(quantity - 1, 0);
    await syncParametrCart(nextQuantity);
  };

  const handleAddAndClose = async () => {
    if (await handleAdd()) closeDetail();
  };
  const dragExpandOffset = Math.max(0, -dragDeltaY);
  const dragCloseOffset = Math.max(0, dragDeltaY);
  const isCenterDesktop = isDesktop && desktopVariant === "center";
  const isRightDrawerDesktop = isDesktop && desktopVariant === "rightDrawer";
  const detailContent = (
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
              <span className="inline-flex rounded-lg bg-gray10 px-3 py-1 text-xs font-bold text-black lg:rounded-xl lg:px-3.5 lg:py-1.5">
                {detail.category.name}
              </span>
            )}

            <div className="mt-3 flex items-start justify-between gap-4">
              <h2 className="min-w-0 flex-1 text-lg font-bold leading-6 text-black lg:text-[22px] lg:leading-7">
                {detail.name}
              </h2>

              {detail.amount > 0 && (
                <span className="shrink-0 rounded-full bg-gray10 px-3 py-1.5 text-xs font-bold text-gray220">
                  {detail.amount} {unit ?? t("product_gram_unit")}
                </span>
              )}
            </div>

            <div className="mt-3 flex items-center gap-2">
              <p className="text-[22px] font-extrabold leading-7 text-black lg:text-[26px] lg:leading-8">
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
                  className="mt-1 text-sm font-bold text-black underline-offset-2 hover:underline"
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
  const drawerContent = (
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
  const footer = (
    <ProductDetailFooter
      quantity={quantity}
      totalPrice={formatPrice(totalPrice)}
      sumLabel={t("sum")}
      hasCart={Boolean(cartItem)}
      isLoading={isStockLoading}
      onAdd={handleAdd}
      onAddAndClose={handleAddAndClose}
      onDecrement={handleDecrementDetail}
      onChangeQuantity={handleChangeQuantity}
    />
  );

  if (isCenterDesktop) {
    return (
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent
          showCloseButton={false}
          className="max-h-[calc(100vh-48px)] !w-[542px] min-w-[542px] !max-w-[calc(100vw-40px)] overflow-hidden rounded-[24px] border-0 bg-white p-0 shadow-[0_24px_70px_rgba(15,23,42,0.22)]"
        >
          <DialogTitle className="sr-only">{detail.name}</DialogTitle>
          <XButton
            size="lg"
            onClick={closeDetail}
            className="absolute right-4 top-4 z-40 bg-white/90 text-black backdrop-blur"
          />
          {detailContent}
          {footer}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetContent
        side={isDesktop ? "right" : "bottom"}
        showCloseButton={false}
        style={
          isDesktop
            ? undefined
            : {
                // Collapsed height is content-fitted (auto, capped at 80dvh via
                // className); an explicit height is only set while expanded or
                // while being dragged upward.
                height: isExpanded
                  ? "100dvh"
                  : dragExpandOffset
                    ? `min(100dvh, ${dragStartHeight + dragExpandOffset}px)`
                    : undefined,
                maxHeight: dragExpandOffset ? "100dvh" : undefined,
                transform: dragCloseOffset
                  ? `translateY(${dragCloseOffset}px)`
                  : undefined,
              }
        }
        className={`overflow-visible border-0 bg-white p-0 shadow-[0_-18px_48px_rgba(15,23,42,0.22)] transition-[height,transform,border-radius] data-[state=closed]:duration-300 data-[state=closed]:ease-in-out data-[state=open]:ease-out lg:h-full lg:w-[510px] lg:max-w-[510px] lg:overflow-hidden lg:border-l lg:border-gray180 lg:bg-white lg:shadow-[-18px_0_44px_rgba(15,23,42,0.12)] ${
          isDragging ? "duration-0" : "duration-200"
        } ${
          isDesktop
            ? "rounded-none"
            : isExpanded
              ? "h-dvh max-h-dvh rounded-none"
              : "max-h-[80dvh] rounded-t-[28px]"
        }`}
      >
        <SheetTitle className="sr-only">{detail.name}</SheetTitle>

        {!isRightDrawerDesktop && (
          <XButton
            size="lg"
            onClick={closeDetail}
            className="absolute right-4 top-4 z-40 hidden bg-white/90 text-black backdrop-blur lg:right-5 lg:top-5 lg:flex"
          />
        )}

        <button
          type="button"
          aria-label={t("product_resize_detail")}
          onPointerDown={(event) => {
            event.currentTarget.setPointerCapture(event.pointerId);
            handleDragStart(
              event.clientY,
              event.currentTarget.parentElement?.getBoundingClientRect()
                .height ?? 0,
            );
          }}
          onPointerMove={(event) => handleDragMove(event.clientY)}
          onPointerUp={(event) => handleDragEnd(event.clientY)}
          onPointerCancel={() => {
            dragStartYRef.current = null;
            setIsDragging(false);
            setDragDeltaY(0);
          }}
          className={`absolute left-1/2 z-30 flex h-7 w-20 -translate-x-1/2 touch-none select-none items-center justify-center border-0 bg-transparent p-0 outline-none focus:outline-none focus-visible:outline-none lg:hidden ${
            isExpanded ? "top-2" : "-top-7"
          }`}
        >
          <span className="h-1.5 w-11 rounded-full bg-gray180 shadow-sm" />
        </button>

        {isRightDrawerDesktop ? drawerContent : detailContent}
        {footer}
      </SheetContent>
    </Sheet>
  );
};

export default ProductDetailMobile;












