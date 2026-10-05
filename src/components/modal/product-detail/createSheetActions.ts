"use client";

import type { ProductDetailBaseContext } from "./productDetailView";
import type { getProductDetailView } from "./productDetailView";

export type ProductDetailViewContext = ProductDetailBaseContext &
  ReturnType<typeof getProductDetailView>;

export const createSheetActions = (ctx: ProductDetailViewContext) => {
  const {
    closeProductDetail,
    openProductBranchPicker,
    setSkuState,
    setParameterErrorState,
    isExpanded,
    setIsExpanded,
    setIsDragging,
    dragStartYRef,
    canExpandRef,
    contentScrollRef,
    setDragDeltaY,
    setDragStartHeight,
    detail,
  } = ctx;

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

  return {
    resetSelection,
    closeDetail,
    handleOpenChange,
    handleChooseAnotherBranch,
    handleDragStart,
    handleDragMove,
    handleDragEnd,
  };
};
