import { Minus, Plus } from "lucide-react";

type CartActionProps = {
  quantity: number;
  hasCart: boolean;
  onAdd: () => void;
  onIncrement: () => void;
  onDecrement: () => void;
};

const CartAction = ({
  quantity,
  hasCart,
  onAdd,
  onIncrement,
  onDecrement,
}: CartActionProps) => {
  if (!hasCart) {
    return (
      <button
        type="button"
        onClick={onAdd}
        className="grid h-[38px] w-[38px] place-items-center rounded-full bg-white text-primary ring-1 ring-black/5"
      >
        <Plus size={20} strokeWidth={2.4} />
      </button>
    );
  }

  return (
    <div className="flex h-[38px] min-w-[98px] items-center justify-between rounded-full bg-white px-1.5 text-primary ring-1 ring-black/5">
      <button
        type="button"
        onClick={onDecrement}
        className="grid h-[38px] w-[38px] place-items-center rounded-full text-primary"
      >
        <Minus size={20} strokeWidth={2.4} />
      </button>

      <span className="min-w-6 text-center text-sm font-extrabold text-black lg:text-base">
        {quantity}
      </span>

      <button
        onClick={onIncrement}
        className="grid h-[38px] w-[38px] place-items-center rounded-full text-primary"
      >
        <Plus size={20} strokeWidth={2.4} />
      </button>
    </div>
  );
};

export default CartAction;
