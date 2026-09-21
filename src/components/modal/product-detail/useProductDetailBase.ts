"use client";

import { getProductDetail } from "@/apis/products";
import { postCart } from "@/apis/cart";
import { useProductBranchPickerStore } from "@/stores/product-branch-picker";
import { useProductDetailStore } from "@/stores/product-detail";
import { useCartStore } from "@/stores/cart";
import { useTranslations } from "next-intl";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "@/stores/auth";
import { useBranchSelection } from "@/components/branch-selection";

// Store selections, the detail query, the add-to-cart mutation and the
// sheet/selection state behind the product detail view.
export const useProductDetailBase = () => {
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

  return {
    t,
    product,
    isOpen,
    closeProductDetail,
    saleBadgeVariant,
    productDetailVariant,
    desktopVariant,
    carts,
    setCarts,
    customerId,
    setLoginModal,
    selectedBranchId,
    openProductBranchPicker,
    queryClient,
    photoState,
    setPhotoState,
    skuState,
    setSkuState,
    parameterErrorState,
    setParameterErrorState,
    isExpanded,
    setIsExpanded,
    isDragging,
    setIsDragging,
    dragStartYRef,
    canExpandRef,
    contentScrollRef,
    requiredParameterRef,
    dragDeltaY,
    setDragDeltaY,
    dragStartHeight,
    setDragStartHeight,
    isDesktop,
    setIsDesktop,
    data,
    isLoading,
    stockMutation,
  };
};
