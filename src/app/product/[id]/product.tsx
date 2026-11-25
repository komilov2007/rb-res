"use client";

import { useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import HomePage from "@/app/page";
import { getProductDetail } from "@/apis/products";
import { ROUTER } from "@/constants/router";
import { REACT_QUERY_KEYS } from "@/constants/react-query-keys";
import { useShopId } from "@/hooks/useShopId";
import { useProductDetailStore } from "@/stores/product-detail";

// Deep link (old webapp /[shop]/product/[slug] parity): renders the home page
// and opens the existing product detail over it.
export const useProductDeepLink = () => {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const { shopid, hasShopId } = useShopId();
  const productId = Number(id);
  const isOpen = useProductDetailStore((state) => state.isOpen);
  const openProductDetail = useProductDetailStore(
    (state) => state.openProductDetail,
  );
  const openedRef = useRef(false);

  const { data, isError } = useQuery({
    enabled: hasShopId && Number.isFinite(productId) && productId > 0,
    queryKey: [REACT_QUERY_KEYS.PRODUCT_DETAIL, productId],
    queryFn: () => getProductDetail(productId),
    retry: false,
  });

  const homeUrl = `${ROUTER.HOME}${shopid ? `?shop_id=${shopid}` : ""}`;

  useEffect(() => {
    if (!data?.data || openedRef.current) return;

    openedRef.current = true;
    openProductDetail(data.data);
  }, [data, openProductDetail]);

  // Closing the detail (or a missing product) leaves the deep link for home.
  useEffect(() => {
    if (isError || (openedRef.current && !isOpen)) router.replace(homeUrl);
  }, [isError, isOpen, homeUrl, router]);
};

const Product = () => {
  useProductDeepLink();

  return <HomePage />;
};

export default Product;
