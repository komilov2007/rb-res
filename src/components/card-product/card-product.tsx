import { IconFlameFilled } from "@tabler/icons-react";
import { useTranslations } from "next-intl";

import type { CardProductProps } from "@/types/product";
import { useProductDetailStore } from "@/stores/product-detail";
import { formatPrice } from "@/utils/format-price";
import { handleImageFallback, IMAGE_PLACEHOLDER_SRC } from "@/utils/image";

import CartAction from "./cart-action";
import { useCardProduct } from "./useCardProduct";
import {
  CARD_HEIGHT_CLASS,
  SALE_VARIANT_CLASS_NAMES,
  shouldUseDiscountCard,
} from "./utils";

const CardProduct = ({
  product,
  variant = "default",
  saleBadgeVariant = "red",
  isUnavailable = false,
  whiteSurface = false,
}: CardProductProps) => {
  const t = useTranslations();
  const {
    price,
    quantity,
    isDiscount,
    showOldPrice,
    handleAddCart,
    handleIncrement,
    handleDecrement,
    handleChangeQuantity,
    isStockLoading,
  } = useCardProduct({ product, variant, saleBadgeVariant });
  const openProductDetail = useProductDetailStore(
    (state) => state.openProductDetail,
  );
  const isDiscountCard = shouldUseDiscountCard(variant, isDiscount);
  const saleVariantClassName = SALE_VARIANT_CLASS_NAMES[saleBadgeVariant];
  const saleLabel =
    product.sale_type === "PERCENT"
      ? `-${product.sale_amount}%`
      : `-${formatPrice(product.sale_amount ?? 0)} ${t("sum")}`;

  return (
    <article
      data-unavailable={isUnavailable || undefined}
      onClick={() => {
        // Not sold at the selected branch: the card is inert — the muted
        // styling and the badge are the whole feedback.
        if (isUnavailable) return;

        openProductDetail(product, saleBadgeVariant, "default");
      }}
      // The browser's own default tap-highlight (a harsh gray/black flash
      // on mobile) is what made pressing this look bad — the group-active
      // overlay div below replaces it with a deliberately light one, so
      // that default needs turning off here or the two would show at once.
      style={{ WebkitTapHighlightColor: "transparent" }}
      className={`group relative flex ${CARD_HEIGHT_CLASS} w-full cursor-pointer flex-col rounded-[18px] transition-transform duration-200 ease-out active:scale-[0.98] lg:rounded-[20px] lg:border lg:border-gray180 lg:duration-300 lg:hover:-translate-y-0.5 ${
        isDiscountCard
          ? "overflow-visible bg-white ring-1 ring-black/5 lg:ring-0"
          : `${
              whiteSurface ? "bg-white" : "bg-gray10 lg:bg-white"
            } ring-1 ring-black/5 lg:shadow-none lg:ring-0`
      }`}
    >
      {/* Soft, uniform press feedback (a light tint over the whole card,
          image included) instead of the browser's own harsh default —
          pointer-events-none so it never intercepts the tap it's reacting
          to. z-[15]: above the image/content (z-10) so it actually tints
          them, but below the unavailable popover (z-20) below — without
          that, pressing a branch row inside the open popover would also
          tint the popover itself, since :active on this <article> is also
          true while a descendant inside it is being pressed. */}
      <div className="pointer-events-none absolute inset-0 z-15 rounded-[18px] bg-black/5 opacity-0 transition-opacity duration-150 group-active:opacity-100 lg:rounded-[20px]" />

      {/* Dims/desaturates the photo + price/name block only — the popover
          above sits outside this wrapper specifically so it isn't also
          grayscaled: a CSS filter applies to an element's whole rendered
          subtree, so putting it on the <article> itself (as before) was
          desaturating "Olmazorda bor" along with everything else, when the
          point of that row is to read as the opposite of dimmed. */}
      <div
        className={`flex min-h-0 flex-1 flex-col ${
          isUnavailable ? "opacity-80 grayscale" : ""
        }`}
      >
        <div
          className={`relative z-10 shrink-0 bg-gray10 ${
            isDiscountCard
              ? "h-[170px] overflow-hidden rounded-[18px] lg:h-[240px] lg:rounded-[20px]"
              : "h-[170px] overflow-hidden rounded-[18px] lg:h-[240px] lg:rounded-[20px]"
          }`}
        >
          <div className="h-full w-full overflow-hidden rounded-[inherit]">
            <img
              src={product.photo || IMAGE_PLACEHOLDER_SRC}
              alt={product.name}
              onError={handleImageFallback}
              className="h-full w-full object-cover"
            />
          </div>

          {isUnavailable && (
            <span className="absolute left-2 top-2 z-20 rounded-full bg-black/70 px-2 py-1 text-[10px] font-medium leading-none text-white">
              {t("product_not_in_this_branch")}
            </span>
          )}

          {isDiscountCard && product.sale_amount && (
            <span
              className={`absolute right-1 top-2 z-20 flex h-7 items-center gap-1 rounded-full py-0.5 pl-0.5 pr-2.5 text-[9px] font-medium leading-none text-white shadow-[0_6px_14px_rgba(17,24,39,0.16)] ring-1 ring-white/70 ${saleVariantClassName.badge}`}
            >
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full border border-white/70 text-xs font-medium leading-none text-white ${saleVariantClassName.badge}`}
              >
                <IconFlameFilled size={18} />
              </span>
              {t("discount")}
            </span>
          )}
        </div>

        <div
          className={`relative flex min-h-0 flex-1 flex-col rounded-b-[18px] px-4 lg:rounded-b-[20px] lg:px-4 ${
            isDiscountCard
              ? "-mt-5 bg-white pb-4 pt-7 lg:-mt-8 lg:min-h-[174px] lg:pb-4 lg:pt-10"
              : `-mt-5 pb-4 pt-8 lg:-mt-8 lg:min-h-[174px] lg:pb-4 lg:pt-10 ${
                  whiteSurface ? "bg-white" : "bg-gray10 lg:bg-white"
                }`
          }`}
        >
          <div className="flex flex-col gap-1.5 lg:gap-1.5">
            <div className="min-w-0">
              {showOldPrice && (
                <div className="flex w-full min-w-0 items-center gap-2">
                  <p className="text-[11px] font-normal leading-none text-red-500 line-through lg:text-xs">
                    {formatPrice(product.price)} {t("sum")}
                  </p>
                  {isDiscountCard && product.sale_amount && (
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium leading-none text-white ${saleVariantClassName.badge}`}
                    >
                      {saleLabel}
                    </span>
                  )}
                </div>
              )}
              <p className="mt-1 text-[13px] font-medium leading-[15px] text-black lg:text-[15px] lg:leading-4">
                {formatPrice(price)} {t("sum")}
              </p>
            </div>

            <div className="min-h-[40px] lg:min-h-[44px]">
              <h6 className="line-clamp-2 break-normal text-xs font-normal leading-4 text-gray220 lg:leading-[15px]">
                {product.name}
              </h6>

              {product.amount > 0 && (
                <span className="mt-1.5 block text-xs font-medium text-gray220">
                  {product.amount} {t("product_gram_unit")}
                </span>
              )}
            </div>
          </div>

          <div
            className={`mt-auto flex justify-end rounded-2xl ${
              isDiscountCard
                ? "-translate-y-[11px] lg:-translate-y-0.5"
                : "translate-y-0 lg:-translate-y-0.5"
            }`}
          >
            <div
              onClick={(event) => event.stopPropagation()}
              // Blocks the add/+/- buttons before they run when the product
              // isn't sold at the selected branch.
              onClickCapture={(event) => {
                if (!isUnavailable) return;

                event.stopPropagation();
              }}
              className="mt-2 flex w-full justify-end lg:mt-0 lg:translate-y-0 [&>div]:lg:max-w-none"
            >
              <CartAction
                quantity={quantity}
                hasCart={quantity > 0}
                onAdd={handleAddCart}
                onIncrement={handleIncrement}
                onDecrement={handleDecrement}
                onChangeQuantity={handleChangeQuantity}
                isLoading={isStockLoading}
              />
            </div>
          </div>
        </div>
      </div>

    </article>
  );
};

export default CardProduct;
