import { useState } from "react";
import { Loader2, Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import Button from "@/components/ui/button";
import { useCartStore } from "@/stores/cart";
import { formatPrice } from "@/utils/format-price";
import { IMAGE_PLACEHOLDER_SRC, handleImageFallback } from "@/utils/image";
import { hasDiscount } from "@/utils/product";
import type { CartItemProps, CartViewProps } from "@/types/cart";
import { getCartList, updateCartItem } from "@/apis/cart";
import { getProductDetail } from "@/apis/products";
import { useAuthStore } from "@/stores/auth";
import { normalizeCartItems } from "@/utils/cart";
import { ProductDetailSkeleton } from "@/components/ui/skleton";
import {
  ProductDetailMedia,
  ProductParameter,
} from "@/components/modal/product-detail/components";
import { getOldPrice, stripHtml } from "@/components/modal/product-detail/utils";
import { SALE_VARIANT_CLASS_NAMES } from "@/components/card-product/utils";

type CartBodyProps = CartViewProps & {
  viewingItem: CartItemProps | null;
  onView: (productId: number) => void;
};

const CartBody = ({ isMobile, viewingItem, onView }: CartBodyProps) => {
  const carts = useCartStore((state) => state.carts);

  return (
    <div
      className={
        isMobile
          ? "min-h-0 flex-1 overflow-y-auto border-t border-gray180"
          : "min-h-0 flex-1 overflow-y-auto"
      }
    >
      {viewingItem ? (
        <CartItemDetail item={viewingItem} />
      ) : carts.length === 0 ? (
        <EmptyCart isMobile={isMobile} />
      ) : (
        <ul>
          {carts.map((item, index) => (
            <CartItem
              // The same product can be in the cart more than once (e.g.
              // different parameters) — the cart line id is the unique one;
              // guest items have none, so fall back to product id + index.
              key={item.id ?? `${item.product.id}-${index}`}
              item={item}
              isMobile={isMobile}
              onView={() => onView(item.product.id)}
            />
          ))}
        </ul>
      )}
    </div>
  );
};

const EmptyCart = ({ isMobile }: CartViewProps) => {
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
        <ShoppingCart size={isMobile ? 28 : 32} strokeWidth={1.8} />
      </div>

      <h3
        className={
          isMobile
            ? "mt-4 text-base font-extrabold text-black"
            : "mt-5 text-lg font-extrabold text-black"
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

// Confirmed live against GET webapp/card/list/{customer}: an authenticated
// cart item's parameter/ad_parameter come back as {name, status, amount}
// (no id) — and a guest/local item carries the full ProductSkuProps object
// (built client-side in product-detail.tsx's handleAdd). Both real shapes
// always carry `.name` directly, so no id-based lookup against the
// product's own parameter definitions is actually needed.
const getSelectedParameterNames = (item: CartItemProps): string[] =>
  [item.parameter, ...(item.ad_parameter ?? [])]
    .map((value) => value?.name)
    .filter((name): name is string => Boolean(name));

const getSaleLabel = (
  product: CartItemProps["product"],
  sumLabel: string,
) =>
  product.sale_type === "PERCENT"
    ? `-${product.sale_amount}%`
    : `-${formatPrice(product.sale_amount ?? 0)} ${sumLabel}`;

const CartItem = ({
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
    queryKey: ["product-detail", item.product.id],
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
      setCartQuantity(item.product.id, nextQuantity);
      return;
    }

    const response = await stockMutation.mutateAsync({
      id: item.id,
      quantity: nextQuantity,
      data: {
        branch_id: branchId ? String(branchId) : undefined,
      },
    });

    setCartQuantity(item.product.id, response.data.quantity);

    void refreshCartList();
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

  return (
    <li
      className={
        isMobile
          ? "border-b border-gray180 px-4 py-4"
          : "border-b border-gray180 px-6 py-5"
      }
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

              {isUnavailable && (
                <p className="mt-0.5 text-xs font-medium text-red-500">
                  {t("cart_drawer_unavailable_at_branch")}
                </p>
              )}

              {parameterNames.length > 0 && (
                <p className="mt-0.5 truncate text-xs font-normal text-gray220">
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
                      className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-extrabold leading-none text-white ${SALE_VARIANT_CLASS_NAMES.red.badge}`}
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
                openRemoveModal(item.product.id);
              }}
            >
              <Trash2 size={15} strokeWidth={2} />
            </Button>
          </div>
        </div>
      </div>
    </li>
  );
};

// Read-only view — the cart item's parameter is already fixed once it's in
// the cart, so unlike the full ProductDetailMobile (which owns its own
// Sheet/Dialog and an add-to-cart mutation flow) this only needs to reuse
// the media gallery + text formatting, not the whole parameter-selection or
// footer/mutation machinery. The back control lives in CartHeader's own
// header slot (swapped in by the parent), not here, so there's only ever
// one header shown at a time.
const CartItemDetail = ({ item }: { item: CartItemProps }) => {
  const t = useTranslations();
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const { data, isLoading } = useQuery({
    enabled: Boolean(item.product.id),
    queryKey: ["product-detail", item.product.id],
    queryFn: () => getProductDetail(item.product.id),
  });

  const detail = data?.data ?? item.product;
  const photos = data?.data.photos?.length
    ? data.data.photos
        .map((photo) => photo.photo)
        .filter((photo): photo is string => Boolean(photo))
    : [detail.photo].filter((photo): photo is string => Boolean(photo));
  const image = photos[activePhotoIndex] || photos[0] || IMAGE_PLACEHOLDER_SRC;
  const description = stripHtml(data?.data.desc || detail.description);
  const price = item.product.discount_price ?? item.product.price;
  const oldPrice = getOldPrice({
    price: detail.price,
    discountPrice: detail.discount_price,
    saleAmount: detail.sale_amount,
    saleType: detail.sale_type,
  });
  // Same discount-source fix as the row: use the fetched product detail,
  // not item.product (which the cart-list response never populates with
  // sale_type/sale_amount for an authenticated cart item).
  const isOnSale = Boolean(data?.data && hasDiscount(data.data));
  const saleLabel = data?.data ? getSaleLabel(data.data, t("sum")) : "";
  // The cart item only ever carries the selected sku's *name* (STEP 15),
  // never its id, so the read-only ProductParameter reuse below has to
  // match by name against the fetched product's real parameter/
  // additional_parameter definitions to know which option to highlight.
  const selectedMainSkuIds = data?.data.parameter?.skus
    ? data.data.parameter.skus
        .filter((sku) => sku.name === item.parameter?.name)
        .map((sku) => sku.id)
    : [];
  const selectedAdParameterNames = new Set(
    (item.ad_parameter ?? []).map((sku) => sku.name),
  );
  const hasParameters = Boolean(
    data?.data.parameter?.skus?.length ||
      data?.data.additional_parameter?.some((group) => group.skus?.length),
  );

  return (
    <div>
      {isLoading ? (
        <ProductDetailSkeleton />
      ) : (
        <>
          <ProductDetailMedia
            image={image}
            name={detail.name}
            photos={photos}
            activePhotoIndex={activePhotoIndex}
            hasDiscount={isOnSale}
            saleLabel={saleLabel}
            saleBadgeClassName={SALE_VARIANT_CLASS_NAMES.red.badge}
            onSelectPhoto={setActivePhotoIndex}
          />

          <div className="px-4 pb-5 pt-4">
            {detail.category?.name && (
              <span className="inline-flex rounded-lg bg-gray10 px-3 py-1 text-xs font-bold text-black">
                {detail.category.name}
              </span>
            )}

            <h2 className="mt-3 text-base font-medium leading-5 text-black">
              {detail.name}
            </h2>

            <div className="mt-3 flex items-center gap-2">
              <p className="text-lg font-bold text-black">
                {formatPrice(price)} {t("sum")}
              </p>
              {oldPrice && (
                <p className="text-sm font-normal leading-none text-red-500 line-through">
                  {formatPrice(oldPrice)} {t("sum")}
                </p>
              )}
            </div>

            {description && (
              <p className="mt-4 text-sm font-normal leading-5 text-gray220">
                {description}
              </p>
            )}

            {hasParameters && (
              <div className="mt-5 space-y-3 border-t border-gray180 pt-5">
                {data?.data.parameter?.skus?.length ? (
                  <ProductParameter
                    parameter={data.data.parameter}
                    selectedSkuIds={selectedMainSkuIds}
                    onSelect={() => {}}
                  />
                ) : null}

                {data?.data.additional_parameter?.map((group) => (
                  <ProductParameter
                    key={group.id}
                    parameter={group}
                    selectedSkuIds={group.skus
                      .filter((sku) => selectedAdParameterNames.has(sku.name))
                      .map((sku) => sku.id)}
                    onSelect={() => {}}
                    pricePrefix="+ "
                    multiple={group.type !== "single"}
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

const CartCounter = ({
  isMobile,
  quantity,
  onMinus,
  onPlus,
  isLoading,
}: {
  isMobile: boolean;
  quantity: number;
  onMinus: () => void;
  onPlus: () => void;
  isLoading?: boolean;
}) => {
  return (
    <Button
      asChild
      variant="cart-counter"
      size={isMobile ? "cartCounterMobile" : "cartCounter"}
    >
      <div>
        <Button
          type="button"
          variant="cart-plus"
          size={isMobile ? "cartActionMobile" : "cartAction"}
          onClick={(event) => {
            event.stopPropagation();
            onMinus();
          }}
          disabled={isLoading}
        >
          <Minus size={isMobile ? 14 : 16} strokeWidth={2.2} />
        </Button>

        <span
          className={
            isMobile
              ? "min-w-8 text-center text-sm font-medium text-black"
              : "min-w-9 text-center text-sm font-medium text-black"
          }
        >
          {isLoading ? (
            <Loader2
              size={isMobile ? 14 : 16}
              className="mx-auto animate-spin text-primary"
            />
          ) : (
            quantity
          )}
        </span>

        <Button
          type="button"
          variant="cart-plus"
          size={isMobile ? "cartActionMobile" : "cartAction"}
          onClick={(event) => {
            event.stopPropagation();
            onPlus();
          }}
          disabled={isLoading}
        >
          <Plus size={isMobile ? 14 : 16} strokeWidth={2.2} />
        </Button>
      </div>
    </Button>
  );
};

export default CartBody;
