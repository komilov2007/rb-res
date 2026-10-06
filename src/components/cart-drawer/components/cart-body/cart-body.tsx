import { useCartStore } from "@/stores/cart";
import type { CartItemProps, CartViewProps } from "@/types/cart";
import { EmptyCart } from "./cart-item";
import { CartItemDetail } from "./cart-item-detail";
import { CartItem } from "./cart-item";
import { Loader2, Minus, Plus } from "lucide-react";
import Button from "@/components/ui/button";

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

export const CartCounter = ({
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

export { CartBody };

export default CartBody;
