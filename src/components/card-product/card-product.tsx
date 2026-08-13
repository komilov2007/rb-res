import type { CardProductProps } from "@/types/product";
import { formatPrice } from "@/utils/format-price";
import { Plus } from "lucide-react";
import { useCardProduct } from "./useCardProduct";

const CardProduct = ({ product, variant = "default" }: CardProductProps) => {
  const {
    price,
    counter,
    quantity,
    cartItem,
    isDiscount,
    showOldPrice,
    handleAddCart,
    handleIncrement,
    handleDecrement,
    handleOpenCounter,
  } = useCardProduct({ product, variant });

  return (
    <article className="min-h-[280px] overflow-hidden rounded-3xl bg-white shadow-[0_3px_14px_var(--black40)]">
      <div className="relative h-[187px] overflow-hidden rounded-3xl bg-gray10">
        <img
          src={product.photo}
          alt={product.name}
          className="h-full w-full object-cover"
        />

        {isDiscount && product.sale_amount && (
          <span className="absolute left-3 top-3 rounded-tl-xl rounded-tr-xl rounded-bl-xl bg-yellow-bright px-2 py-1 text-[12px] font-extrabold text-black">
            -{product.sale_amount}%
          </span>
        )}

        {product.is_xit && (
          <span className="absolute right-3 top-3 rounded-full bg-red px-3 py-1 text-xs font-semibold text-white">
            Xit
          </span>
        )}
        <div className="absolute bottom-3 right-3">
          {!cartItem ? (
            <button
              onClick={handleAddCart}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-primary transition-transform duration-200 hover:scale-105 active:scale-95"
            >
              <Plus size={22} />
            </button>
          ) : (
            <div
              className="flex h-8 items-center overflow-hidden rounded-full bg-white text-primary transition-[width] duration-700 ease-in-out"
              style={{ width: counter.value ? 108 : 36 }}
            >
              <button
                onClick={handleDecrement}
                className={`flex h-8 shrink-0 items-center justify-center overflow-hidden text-lg font-bold transition-all duration-500 active:scale-90 ${
                  counter.value
                    ? "w-9 translate-x-0 opacity-100"
                    : "pointer-events-none w-0 -translate-x-5 opacity-0"
                }`}
              >
                -
              </button>

              <button
                onClick={handleOpenCounter}
                className="flex h-8 w-9 shrink-0 items-center justify-center text-sm font-bold transition-transform duration-200 active:scale-95"
              >
                {quantity}
              </button>

              <button
                onClick={handleIncrement}
                className={`flex h-8 shrink-0 items-center justify-center overflow-hidden text-lg font-bold transition-all duration-500 active:scale-90 ${
                  counter.value
                    ? "w-9 translate-x-0 opacity-100"
                    : "pointer-events-none w-0 translate-x-5 opacity-0"
                }`}
              >
                +
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="px-4 pb-6 pt-3">
        <p
          className={`text-base font-bold leading-none ${isDiscount ? "text-blue30" : "text-black"}`}
        >
          {formatPrice(price)} {"so'm"}
        </p>
        {showOldPrice && (
          <p className="text-xs text-gray220 line-through">
            {formatPrice(product.price)} {"so'm"}
          </p>
        )}
        <h6 className="mt-2 line-clamp-2 text-sm font-normal leading-4 text-gray220">
          {product.name}
        </h6>
        {product.amount > 0 && (
          <p className="mt-2 text-sm font-medium text-gray220">
            {product.amount} g
          </p>
        )}
      </div>
    </article>
  );
};

export default CardProduct;
