import { type ChangeEvent, type FocusEvent, useState } from "react";
import { Loader2, Minus, Plus } from "lucide-react";
import { IconShoppingCartFilled } from "@tabler/icons-react";
import { useTranslations } from "next-intl";

type CartActionProps = {
  quantity: number;
  hasCart: boolean;
  onAdd: () => void;
  onIncrement: () => void;
  onDecrement: () => void;
  onChangeQuantity: (quantity: number) => void;
  isLoading?: boolean;
};

const CartAction = ({
  quantity,
  hasCart,
  onAdd,
  onIncrement,
  onDecrement,
  onChangeQuantity,
  isLoading = false,
}: CartActionProps) => {
  const t = useTranslations();
  const [draft, setDraft] = useState({
    quantity,
    value: String(quantity),
  });
  const inputValue =
    draft.quantity === quantity ? draft.value : String(quantity);

  const commitQuantity = (value: string) => {
    const quantityValue = Number(value);

    if (!value || quantityValue < 1) {
      setDraft({
        quantity,
        value: String(quantity),
      });
      return;
    }

    onChangeQuantity(quantityValue);
  };

  const handleChangeQuantity = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.replace(/\D/g, "").slice(0, 3);
    setDraft({
      quantity,
      value,
    });
  };

  const handleBlurQuantity = (event: FocusEvent<HTMLInputElement>) => {
    commitQuantity(event.target.value);
  };
  if (!hasCart && !isLoading) {
    return (
      <button
        onClick={onAdd}
        disabled={isLoading}
        className="flex h-9 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-xs font-medium text-white lg:ml-auto lg:w-full lg:translate-x-0 lg:px-4"
      >
        <IconShoppingCartFilled size={16} />
        <span className="whitespace-nowrap">{t("add_to_cart")}</span>
        <Plus size={18} strokeWidth={2.5} />
      </button>
    );
  }
  return (
    <div className="flex h-10 w-full animate-in items-center justify-between rounded-xl bg-primary10 p-1 text-black fade-in zoom-in-95 lg:ml-auto lg:h-10 lg:min-w-[118px] lg:max-w-[128px] lg:translate-x-0">
      <button
        onClick={onDecrement}
        disabled={isLoading || !hasCart}
        className="grid h-8 w-8 place-items-center rounded-lg bg-white text-primary disabled:opacity-50"
      >
        <Minus size={16} strokeWidth={2.5} />
      </button>
      {isLoading ? (
        <span className="grid h-8 w-10 shrink-0 place-items-center">
          <Loader2 size={16} className="animate-spin text-primary" />
        </span>
      ) : (
        <input
          value={inputValue}
          onChange={handleChangeQuantity}
          onBlur={handleBlurQuantity}
          inputMode="numeric"
          // text-base (16px) avoids iOS Safari's auto-zoom-on-focus.
          className="h-8 w-10 shrink-0 bg-transparent text-center text-base font-medium text-black outline-none"
          maxLength={3}
          pattern="[0-9]*"
        />
      )}
      <button
        onClick={onIncrement}
        disabled={isLoading}
        className="grid h-8 w-8 place-items-center rounded-lg bg-white text-primary disabled:opacity-50"
      >
        <Plus size={16} strokeWidth={2.5} />
      </button>
    </div>
  );
};

export default CartAction;
