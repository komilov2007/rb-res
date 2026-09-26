import { Loader2, Minus, Plus } from "lucide-react";

import Button from "@/components/ui/button";

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
