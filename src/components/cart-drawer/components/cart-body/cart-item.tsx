import { formatPrice } from "@/utils/format-price";
import type { CartItemProps, CartViewProps } from "@/types/cart";
import { IconTrashFilled, IconShoppingCartFilled } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { useMutation, useQuery } from "@tanstack/react-query";
import Button from "@/components/ui/button";
import { useCartStore } from "@/stores/cart";
import { IMAGE_PLACEHOLDER_SRC, handleImageFallback } from "@/utils/image";
import { hasDiscount } from "@/utils/product";
import { updateCartItem } from "@/apis/cart";
import { getProductDetail } from "@/apis/products";
import { useAuthStore } from "@/stores/auth";
import { getCartBranchId } from "@/utils/cart";
import { useRefreshCart } from "@/hooks/useRefreshCart";
import { useBranchSelection } from "@/components/branch-selection";
import { getCartLineKey } from "@/utils/cart-items";
import { getOldPrice } from "@/components/modal/product-detail/product-detail";
import { SALE_VARIANT_CLASS_NAMES } from "@/components/card-product/card-product";
import { CartCounter } from "./cart-body";
import { REACT_QUERY_KEYS } from "@/constants/react-query-keys";

export const getSelectedParameterNames = (item: CartItemProps): string[] =>
  [item.parameter, ...(item.ad_parameter ?? [])]
    .map((value) => value?.name)
    .filter((name): name is string => Boolean(name));

export const getSaleLabel = (
  product: CartItemProps["product"],
  sumLabel: string,
) =>
  product.sale_type === "PERCENT"
    ? `-${product.sale_amount}%`
    : `-${formatPrice(product.sale_amount ?? 0)} ${sumLabel}`;

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
  const openRemoveModal = useCartStore((state) => state.openRemoveModal);
  const customerId = useAuthStore((state) => state.auth?.customer);
  const refreshCart = useRefreshCart();
  const { branchId: selectedBranchId } = useBranchSelection();
  const isInactive = item.is_active === false;
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

  const { data: productDetailData } = useQuery({
    enabled: Boolean(item.product.id),
    queryKey: [REACT_QUERY_KEYS.PRODUCT_DETAIL, item.product.id],
    queryFn: () => getProductDetail(item.product.id),
  });
  const productDetail = productDetailData?.data;

  const price = item.product.discount_price ?? item.product.price;
  const total = price * item.quantity;
  const branchId = getCartBranchId(item.product.branches, selectedBranchId);
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

      await refreshCart();
    } catch {
    }
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

              {isInactive && (
                <p className="mt-0.5 text-xs font-medium text-red-500">
                  {t("cart_drawer_inactive")}
                </p>
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

export const EmptyCart = ({ isMobile }: CartViewProps) => {
  const t = useTranslations();
  const closeCartModal = useCartStore((state) => state.closeCartModal);

  return (
    <div
      className={
        isMobile
          ? "flex min-h-[340px] flex-col items-center justify-center px-6 text-center"
          : "flex h-full min-h-[400px] flex-col items-center justify-center px-6 text-center"
      }
    >
      <div
        className={
          isMobile
            ? "flex h-16 w-16 items-center justify-center rounded-full bg-gray10 text-gray220"
            : "flex h-20 w-20 items-center justify-center rounded-full bg-gray10 text-gray220"
        }
      >
        <IconShoppingCartFilled size={isMobile ? 28 : 32} />
      </div>

      <h3
        className={
          isMobile
            ? "mt-4 text-base font-medium text-black"
            : "mt-5 text-lg font-medium text-black"
        }
      >
        {t("empty_cart")}
      </h3>

      <p className="mt-2 max-w-[280px] text-sm leading-6 text-gray220">
        {t("add_products_hint")}
      </p>

      <Button
        type="button"
        variant="primary-solid"
        size="primaryFit"
        onClick={closeCartModal}
        className="mt-5"
      >
        {t("continue_shopping")}
      </Button>
    </div>
  );
};
