import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";

import Button from "@/components/ui/button";
import { useCartStore } from "@/store/cart";
import { formatPrice } from "@/utils/format-price";
import type { CartItemProps, CartViewProps } from "@/types/cart";

const CartBody = ({ isMobile }: CartViewProps) => {
  const carts = useCartStore((state) => state.carts);

  return (
    <div
      className={
        isMobile
          ? "min-h-0 flex-1 overflow-y-auto border-t border-gray180"
          : "min-h-0 flex-1 overflow-y-auto"
      }
    >
      {carts.length === 0 ? (
        <EmptyCart isMobile={isMobile} />
      ) : (
        <ul>
          {carts.map((item) => (
            <CartItem key={item.product.id} item={item} isMobile={isMobile} />
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
            ? "flex h-16 w-16 items-center justify-center rounded-full bg-primary10 text-primary"
            : "flex h-20 w-20 items-center justify-center rounded-full bg-primary10 text-primary"
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

const CartItem = ({
  item,
  isMobile,
}: {
  item: CartItemProps;
  isMobile: boolean;
}) => {
  const t = useTranslations();
  const incrementCart = useCartStore((state) => state.incrementCart);
  const decrementCart = useCartStore((state) => state.decrementCart);
  const openRemoveModal = useCartStore((state) => state.openRemoveModal);

  const price = item.product.discount_price ?? item.product.price;
  const total = price * item.quantity;

  return (
    <li
      className={
        isMobile
          ? "border-b border-gray180 px-4 py-4"
          : "border-b border-gray180 px-6 py-5"
      }
    >
      <div className="flex gap-3 sm:gap-4">
        <div
          className={
            isMobile
              ? "h-[74px] w-[74px] shrink-0 overflow-hidden rounded-xl bg-gray10"
              : "h-[92px] w-[92px] shrink-0 overflow-hidden rounded-2xl bg-gray10"
          }
        >
          <img
            src={item.product.photo}
            alt={item.product.name}
            className="h-full w-full object-cover"
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h3
                className={
                  isMobile
                    ? "line-clamp-1 text-sm font-bold leading-5 text-black"
                    : "line-clamp-2 text-sm font-bold leading-5 text-black"
                }
              >
                {item.product.name}
              </h3>

              <p className="mt-1 text-xs font-medium text-gray220">
                {formatPrice(price)} {t("sum")}
              </p>
            </div>

            <p className="shrink-0 whitespace-nowrap text-sm font-extrabold text-black">
              {formatPrice(total)} {t("sum")}
            </p>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <CartCounter
              isMobile={isMobile}
              quantity={item.quantity}
              onMinus={() => decrementCart(item.product.id)}
              onPlus={() => incrementCart(item.product.id)}
            />

            <Button
              type="button"
              variant="cart-trash"
              size={isMobile ? "cartTrashMobile" : "cartTrash"}
              onClick={() => openRemoveModal(item.product.id)}
            >
              <Trash2 size={15} strokeWidth={2} />
            </Button>
          </div>
        </div>
      </div>
    </li>
  );
};

const CartCounter = ({
  isMobile,
  quantity,
  onMinus,
  onPlus,
}: {
  isMobile: boolean;
  quantity: number;
  onMinus: () => void;
  onPlus: () => void;
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
          onClick={onMinus}
        >
          <Minus size={isMobile ? 14 : 16} strokeWidth={2.2} />
        </Button>

        <span
          className={
            isMobile
              ? "min-w-8 text-center text-sm font-extrabold text-black"
              : "min-w-9 text-center text-sm font-extrabold text-black"
          }
        >
          {quantity}
        </span>

        <Button
          type="button"
          variant="cart-plus"
          size={isMobile ? "cartActionMobile" : "cartAction"}
          onClick={onPlus}
        >
          <Plus size={isMobile ? 14 : 16} strokeWidth={2.2} />
        </Button>
      </div>
    </Button>
  );
};

export default CartBody;
