"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import XButton from "@/components/ui/x-button";
import { formatPrice } from "@/utils/format-price";
import { ProductDetailFooter } from "./components";
import { useProductDetailBase } from "./useProductDetailBase";
import { getProductDetailView } from "./productDetailView";
import { createSheetActions } from "./createSheetActions";
import { createCartActions } from "./createCartActions";
import { renderDetailContent } from "./renderDetailContent";
import { renderDrawerContent } from "./renderDrawerContent";

const ProductDetailMobile = () => {
  const base = useProductDetailBase();
  const { product } = base;

  if (!product) return null;

  const view = getProductDetailView({ ...base, product });
  const viewCtx = { ...base, product, ...view };
  const sheet = createSheetActions(viewCtx);
  const cart = createCartActions({ ...viewCtx, ...sheet });
  const ctx = { ...viewCtx, ...sheet, ...cart };
  const {
    t,
    isOpen,
    desktopVariant,
    isExpanded,
    isDragging,
    setIsDragging,
    dragStartYRef,
    dragDeltaY,
    setDragDeltaY,
    dragStartHeight,
    isDesktop,
    detail,
    cartItem,
    quantity,
    totalPrice,
    isStockLoading,
    closeDetail,
    handleOpenChange,
    handleDragStart,
    handleDragMove,
    handleDragEnd,
    handleChangeQuantity,
    handleAdd,
    handleDecrementDetail,
    handleAddAndClose,
    dragExpandOffset,
  } = ctx;

  const dragCloseOffset = Math.max(0, dragDeltaY);
  const isCenterDesktop = isDesktop && desktopVariant === "center";
  const isRightDrawerDesktop = isDesktop && desktopVariant === "rightDrawer";
  const renderCtx = {
    ...ctx,
    dragCloseOffset,
    isCenterDesktop,
    isRightDrawerDesktop,
  };
  const detailContent = renderDetailContent(renderCtx);
  const drawerContent = renderDrawerContent(renderCtx);
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

