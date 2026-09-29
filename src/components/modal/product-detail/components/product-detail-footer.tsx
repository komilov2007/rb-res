import { Loader2, Minus, Plus } from "lucide-react";
import { IconShoppingCartFilled } from "@tabler/icons-react";
import { useTranslations } from "next-intl";

type ProductDetailFooterProps = {
  quantity: number;
  totalPrice: string;
  sumLabel: string;
  hasCart: boolean;
  isLoading: boolean;
  onAdd: () => void;
  onAddAndClose: () => void;
  onDecrement: () => void;
  onChangeQuantity: (value: string) => void;
};

const ProductDetailFooter = ({
  quantity,
  totalPrice,
  sumLabel,
  hasCart,
  isLoading,
  onAdd,
  onAddAndClose,
  onDecrement,
  onChangeQuantity,
}: ProductDetailFooterProps) => {
  const t = useTranslations();
  return (
    <div className="absolute bottom-0 left-0 right-0 border-t border-gray180 bg-white px-5 pb-[max(14px,env(safe-area-inset-bottom))] pt-3 lg:px-6 lg:pb-5 lg:pt-4">
      <div className="flex items-center gap-3 lg:gap-4">
        <div className="h-12 w-[122px] shrink-0 lg:h-13 lg:w-[138px]">
          <div className="flex h-full items-center justify-between rounded-2xl border border-gray180 bg-white p-1 text-black">
            <button
              type="button"
              onClick={onDecrement}
              disabled={isLoading || !hasCart}
              className="grid h-10 w-10 place-items-center rounded-xl bg-gray10 text-black disabled:opacity-50"
            >
              <Minus size={16} strokeWidth={2.5} />
            </button>
            {isLoading ? (
              <span className="grid h-10 w-9 place-items-center">
                <Loader2 size={16} className="animate-spin text-primary" />
              </span>
            ) : (
              <input
                value={quantity || 1}
                onChange={(event) => onChangeQuantity(event.target.value)}
                inputMode="numeric"
                maxLength={3}
                pattern="[0-9]*"
                className="h-10 w-9 bg-transparent text-center text-base font-medium text-black outline-none"
              />
            )}
            <button
              type="button"
              onClick={onAdd}
              disabled={isLoading || (quantity || 1) >= 999}
              className="grid h-10 w-10 place-items-center rounded-xl bg-gray10 text-black disabled:opacity-50"
            >
              <Plus size={16} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={onAddAndClose}
          disabled={isLoading}
          className="flex h-12 min-w-0 flex-1 items-center justify-between gap-3 rounded-2xl bg-primary px-5 text-white shadow-[0_10px_24px_rgba(107,83,230,0.28)] disabled:opacity-70 lg:h-13 lg:px-6"
        >
          <span className="flex items-center gap-2 text-sm font-medium">
            <IconShoppingCartFilled size={18} />
            {t("add_to_cart")}
          </span>
          <span className="text-sm font-medium">
            {totalPrice} {sumLabel}
          </span>
        </button>
      </div>
    </div>
  );
};

export default ProductDetailFooter;

