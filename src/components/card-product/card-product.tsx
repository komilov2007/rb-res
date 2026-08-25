import type { CardProductProps } from "@/types/product";
import { formatPrice } from "@/utils/format-price";
import { useCardProduct } from "./useCardProduct";
import { useTranslations } from "next-intl";
import CartAction from "./cart-action";

const CardProduct = ({ product, variant = "default" }: CardProductProps) => {
  const t = useTranslations();
  const {
    price,
    quantity,
    cartItem,
    isDiscount,
    showOldPrice,
    handleAddCart,
    handleIncrement,
    handleDecrement,
  } = useCardProduct({ product, variant });

  return (
    <article className="flex min-h-[254px] w-full flex-col overflow-hidden rounded-[22px] border-x border-b border-gray180 bg-white lg:min-h-[322px] lg:rounded-3xl">
      <div className="relative h-[168px] overflow-hidden rounded-b-[22px] bg-gray10 lg:h-[220px] lg:rounded-b-3xl">
        <img
          src={product.photo}
          alt={product.name}
          className="h-full w-full object-cover"
        />

        <div className="absolute bottom-3 right-3 lg:bottom-4 lg:right-4">
          <CartAction
            quantity={quantity}
            hasCart={Boolean(cartItem)}
            onAdd={handleAddCart}
            onIncrement={handleIncrement}
            onDecrement={handleDecrement}
          />
        </div>
      </div>

      <div className="flex flex-1  flex-col bg-white px-3.5 pb-4 pt-3 lg:px-5 lg:pb-5 lg:pt-4">
        <div className="flex flex-1 flex-col">
          <p
            className={`text-base font-extrabold leading-none text-black lg:text-md mt-[-5px] ${
              isDiscount ? "text-primary" : ""
            }`}
          >
            {formatPrice(price)} {t("sum")}
          </p>
          {showOldPrice && (
            <p className="mt-1 text-xs font-semibold text-gray220 line-through">
              {formatPrice(product.price)} {t("sum")}
            </p>
          )}
          <h6 className="mt-1.5 text-xs font-medium leading-4 text-gray220 lg:text-sm lg:leading-5">
            {product.name}
          </h6>

          {product.amount > 0 && (
            <span className="mt-2 w-fit rounded-md bg-orange-50 px-2.5 py-1 text-[11px] font-extrabold text-orange-500 lg:text-xs">
              {product.amount} g
            </span>
          )}
        </div>
      </div>
    </article>
  );
};

export default CardProduct;
