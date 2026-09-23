import { IconTrashFilled } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import Button from "@/components/ui/button";
import { useCartStore } from "@/stores/cart";
import { formatPrice } from "@/utils/format-price";
import { IMAGE_PLACEHOLDER_SRC, handleImageFallback } from "@/utils/image";
import { hasDiscount } from "@/utils/product";
import type { CartItemProps } from "@/types/cart";
import { getCartList, updateCartItem } from "@/apis/cart";
import { getProductDetail } from "@/apis/products";
import { useAuthStore } from "@/stores/auth";
import { normalizeCartItems } from "@/utils/cart";
import { getCartLineKey } from "@/utils/cart-items";
import { getOldPrice } from "@/components/modal/product-detail/utils";
import { SALE_VARIANT_CLASS_NAMES } from "@/components/card-product/utils";
import { getSelectedParameterNames, getSaleLabel } from "./utils";
import { CartCounter } from "./cart-counter";
import { REACT_QUERY_KEYS } from "@/constants/react-query-keys";

export const CartItem = ({
  item,
  isMobile,
  onView,
}: {
  item: CartItemProps;
  isMobile: boolean;
  onView: () => void;
}) => {
  const t = useTranslations();
  const setCartQuantity = useCartStore((state) => state.setCartQuantity);
  const setCarts = useCartStore((state) => state.setCarts);
  const openRemoveModal = useCartStore((state) => state.openRemoveModal);
  const unavailableItemIds = useCartStore((state) => state.unavailableItemIds);
  const customerId = useAuthStore((state) => state.auth?.customer);
  // Reported unavailable by the order page's createOrder call.
  const isUnavailable =
    typeof item.id === "number" && unavailableItemIds.includes(item.id);
  // Inactive lines aren't ordered or counted (see isActiveCartLine) — shown
  // faded with a label so that's visible; trash still works.
  const isInactive = item.is_active === false;
  const queryClient = useQueryClient();
  const stockMutation = useMutation({
    mutationFn: ({
      id,
      quantity,
      data,
    }: {
      id: number;
      quantity: number;
      data: { branch_id?: string };
    }) => updateCartItem(id, quantity, data),
  });

  // The cart-list response's `product` sub-object (ApiCartItemProps) only
  // ever carries {id, name, photo, status, amount} — confirmed live, same
  // investigation as STEP 14/15 — so sale_type/sale_amount/discount_price
  // are never actually present on `item.product` for an authenticated cart.
  // Reuse the same getProductDetail call/query-key the embedded detail view
  // already uses (React Query dedupes it if that item's detail was already
  // viewed) instead of adding a new API call, just to source the discount
  // fields the list endpoint doesn't provide.
  const { data: productDetailData } = useQuery({
    enabled: Boolean(item.product.id),
    queryKey: [REACT_QUERY_KEYS.PRODUCT_DETAIL, item.product.id],
    queryFn: () => getProductDetail(item.product.id),
  });
  const productDetail = productDetailData?.data;

  const price = item.product.discount_price ?? item.product.price;
  const total = price * item.quantity;
  const branchId = item.product.branches?.[0];
  const parameterNames = getSelectedParameterNames(item);
  const isOnSale = Boolean(productDetail && hasDiscount(productDetail));
  const saleLabel = productDetail ? getSaleLabel(productDetail, t("sum")) : "";
  const oldPrice = productDetail
    ? getOldPrice({
        price: productDetail.price,
        discountPrice: productDetail.discount_price,
        saleAmount: productDetail.sale_amount,
        saleType: productDetail.sale_type,
      })
    : null;

  const syncStockQuantity = async (nextQuantity: number) => {
    if (!customerId || !item.id) {
      setCartQuantity(getCartLineKey(item), nextQuantity);
      return;
    }

    try {
      const response = await stockMutation.mutateAsync({
        id: item.id,
        quantity: nextQuantity,
        data: {
          branch_id: branchId ? String(branchId) : undefined,
        },
      });

      setCartQuantity(getCartLineKey(item), response.data.quantity);

      await refreshCartList(customerId);
    } catch {
      // The global request interceptor already toasts the backend's message.
    }
  };

  // fetchQuery with staleTime 0 already refetches and writes the fresh list
  // into the CART_LIST cache — no extra invalidation (a second request).
  const refreshCartList = async (customer: number) => {
    const cartListResponse = await queryClient.fetchQuery({
      queryKey: [REACT_QUERY_KEYS.CART_LIST, customer],
      queryFn: () => getCartList(customer),
      staleTime: 0,
    });

    setCarts(
      normalizeCartItems(cartListResponse.data, useCartStore.getState().carts),
    );
  };

  return (
    <li
      className={`${
        isMobile
          ? "border-b border-gray180 px-4 py-4"
          : "border-b border-gray180 px-6 py-5"
      } ${isInactive ? "opacity-60" : ""}`}
    >
      <div
        role="button"
        tabIndex={0}
        onClick={onView}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") onView();
        }}
        className="flex cursor-pointer gap-3 sm:gap-4"
      >
        <div
          className={
            isMobile
              ? "h-[74px] w-[74px] shrink-0 overflow-hidden rounded-xl bg-gray10"
              : "h-[92px] w-[92px] shrink-0 overflow-hidden rounded-2xl bg-gray10"
          }
        >
          <img
            src={item.product.photo || IMAGE_PLACEHOLDER_SRC}
            alt={item.product.name}
            onError={handleImageFallback}
            className="h-full w-full object-cover"
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h3
                className={
                  isMobile
                    ? "line-clamp-1 text-sm font-medium leading-5 text-black"
                    : "line-clamp-2 text-sm font-medium leading-5 text-black"
                }
              >
                {item.product.name}
              </h3>

              {isInactive ? (
                <p className="mt-0.5 text-xs font-medium text-red-500">
                  {t("cart_drawer_inactive")}
                </p>
              ) : (
                isUnavailable && (
                  <p className="mt-0.5 text-xs font-medium text-red-500">
                    {t("cart_drawer_unavailable_at_branch")}
                  </p>
                )
              )}

              {parameterNames.length > 0 && (
                <p className="info-value truncate">
                  {parameterNames.join(", ")}
                </p>
              )}

              <div className="mt-1 flex flex-col gap-0.5">
                {isOnSale && oldPrice && (
                  <div className="flex items-center gap-1.5">
                    <p className="text-[11px] font-normal leading-none text-red-500 line-through">
                      {formatPrice(oldPrice)} {t("sum")}
                    </p>
                    <span
                      className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium leading-none text-white ${SALE_VARIANT_CLASS_NAMES.red.badge}`}
                    >
                      {saleLabel}
                    </span>
                  </div>
                )}

                <p className="text-xs font-medium text-gray220">
                  {formatPrice(price)} {t("sum")}
                </p>
              </div>
            </div>

            <p className="shrink-0 whitespace-nowrap text-sm font-medium text-black">
              {formatPrice(total)} {t("sum")}
            </p>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <CartCounter
              isMobile={isMobile}
              quantity={item.quantity}
              isLoading={stockMutation.isPending}
              onMinus={() => syncStockQuantity(Math.max(item.quantity - 1, 0))}
              onPlus={() => syncStockQuantity(item.quantity + 1)}
            />

            <Button
              type="button"
              variant="cart-trash"
              size={isMobile ? "cartTrashMobile" : "cartTrash"}
              onClick={(event) => {
                event.stopPropagation();
                openRemoveModal(getCartLineKey(item));
              }}
            >
              <IconTrashFilled size={15} />
            </Button>
          </div>
        </div>
      </div>
    </li>
  );
};
