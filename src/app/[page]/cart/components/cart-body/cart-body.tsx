
import { useCartStore } from "@/stores/cart";
import type { CartItemProps, CartViewProps } from "@/types/cart";
import { EmptyCart } from "./empty-cart";
import { CartItemDetail } from "./cart-item-detail";
import { CartItem } from "./cart-item";

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

export default CartBody;
