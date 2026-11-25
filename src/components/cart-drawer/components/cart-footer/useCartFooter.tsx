import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth";
import { useBranchSelectionStore } from "@/stores/branch-selection";
import { useCartStore } from "@/stores/cart";
import { useShopStatusStore } from "@/stores/shop-status";
import { useGeneral } from "@/hooks/useGeneral";
import { useShopId } from "@/hooks/useShopId";
import { updateCartStatus } from "@/apis/cart";
import { ROUTER } from "@/constants/router";
import { useBranchSelection } from "@/components/branch-selection";
import { showProductUnavailable } from "@/utils/branch-availability";
import { useTranslations } from "next-intl";
import { IconBuildingStore, IconTruckFilled } from "@tabler/icons-react";
import Button from "@/components/ui/button";
import { formatPrice } from "@/utils/format-price";
import type { CartViewProps } from "@/types/cart";
import { getServiceMinPrice, isOnlyPickup } from "@/utils/delivery-rules";
import { MinOrderNotice, useDeliveryInfoLabel } from "@/components/delivery-info";

// Minimal order sum for the service chosen on the home screen
// (DELIVERY by default — same as rb-webapp when nothing is chosen yet).
export const useCartMinOrder = (total: number) => {
  const { data: general } = useGeneral();
  const { serviceType } = useBranchSelection();
  const onlyPickup = isOnlyPickup(general?.data);
  const minPrice = getServiceMinPrice(
    general?.data,
    serviceType ?? (onlyPickup ? "PICKUP" : "DELIVERY"),
  );

  return {
    minPrice,
    onlyPickup,
    isPickup: onlyPickup || serviceType === "PICKUP",
    isBelowMin: minPrice !== null && total < minPrice,
  };
};

const isShopBusiness = false;

export const useCartFooter = (total: number) => {
  const router = useRouter();
  const { shopid } = useShopId();

  const carts = useCartStore((state) => state.carts);
  const closeCartModal = useCartStore((state) => state.closeCartModal);
  const pendingCheckout = useCartStore((state) => state.pendingCheckout);
  const setPendingCheckout = useCartStore((state) => state.setPendingCheckout);
  const hasAccess = useAuthStore((state) => state.hasAccess);
  const hasFirstname = useAuthStore((state) =>
    Boolean(state.auth?.firstname?.trim()),
  );
  const customerId = useAuthStore((state) => state.auth?.customer);
  const setLoginModal = useAuthStore((state) => state.setLoginModal);
  const setSignupModal = useAuthStore((state) => state.setSignupModal);
  const { hasSelection, branchId } = useBranchSelection();
  const setSelectionModal = useBranchSelectionStore(
    (state) => state.setSelectionModal,
  );
  const { data: general, refetch: refetchGeneral } = useGeneral();
  const openClosedModal = useShopStatusStore((state) => state.openClosedModal);
  const { isBelowMin } = useCartMinOrder(total);

  const statusMutation = useMutation({
    mutationFn: (items: number[]) =>
      updateCartStatus(customerId as number, shopid as string, { items }),
  });

  const goToOrder = () => {
    closeCartModal();
    setSelectionModal(false);
    router.push(`${ROUTER.ORDER}${shopid ? `?shop_id=${shopid}` : ""}`);
  };

  const handleContinue = async () => {
    const freshGeneral = shopid ? (await refetchGeneral()).data : undefined;

    if ((freshGeneral ?? general)?.data.is_open === false) {
      closeCartModal();
      openClosedModal();
      return;
    }

    if (!hasAccess) {
      closeCartModal();
      setPendingCheckout(true);
      setLoginModal(true);
      return;
    }

    if (!hasFirstname) {
      closeCartModal();
      setPendingCheckout(true);
      setSignupModal(true);
      return;
    }

    if (!hasSelection) {
      closeCartModal();
      setPendingCheckout(true);
      setSelectionModal(true);
      return;
    }

    const unavailableItems =
      branchId === null
        ? []
        : carts.filter((item) =>
            Boolean(
              item.product.branches?.length &&
                !item.product.branches.includes(branchId),
            ),
          );

    if (unavailableItems.length > 0) {
      showProductUnavailable(
        unavailableItems.map((item) => item.product.name).join(", "),
      );
      return;
    }

    if (total <= 0 || isBelowMin) return;

    if (!isShopBusiness) {
      goToOrder();
      return;
    }

    const itemIds = carts
      .map((item) => item.id)
      .filter((id): id is number => typeof id === "number");

    if (itemIds.length === 0) {
      goToOrder();
      return;
    }

    const response = await statusMutation.mutateAsync(itemIds);

    if (response.data.is_open !== false) {
      goToOrder();
    }
  };

  useEffect(() => {
    if (!hasAccess || !hasFirstname || !hasSelection || !pendingCheckout) {
      return;
    }

    setPendingCheckout(false);
    void handleContinue();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasAccess, hasFirstname, hasSelection, pendingCheckout]);

  return {
    handleContinue,
    isPending: statusMutation.isPending,
  };
};

type CartFooterProps = CartViewProps & {
  total: number;
  deliveryPrice: number;
  onContinue: () => void;
  isPending: boolean;
};

const CartFooter = ({
  isMobile,
  total,
  deliveryPrice,
  onContinue,
  isPending,
}: CartFooterProps) => {
  const t = useTranslations();
  const { minPrice, onlyPickup, isPickup, isBelowMin } =
    useCartMinOrder(total);
  const deliveryLabel = useDeliveryInfoLabel();

  return (
    <div
      className={
        isMobile
          ? "shrink-0 border-t border-gray180 bg-white px-4 pb-[max(16px,var(--safe-bottom))] pt-4"
          : "shrink-0 border-t border-gray180 bg-white px-6 pb-6 pt-5"
      }
    >
      {onlyPickup ? (
        <div className="mb-3 flex items-center gap-2">
          <IconBuildingStore size={16} className="text-gray220" />
          <span className="info-label">{t("delivery_only_pickup")}</span>
        </div>
      ) : (
        !isPickup &&
        (deliveryPrice > 0 || deliveryLabel) && (
          <div className="mb-3 flex items-start justify-between gap-3">
            <span className="info-label flex shrink-0 items-center gap-2">
              <IconTruckFilled size={16} className="text-gray220" />
              {t("cart_drawer_delivery_price")}
            </span>
            <span className="text-right text-sm font-medium text-black">
              {deliveryPrice > 0
                ? `${formatPrice(deliveryPrice)} ${t("sum")}`
                : deliveryLabel}
            </span>
          </div>
        )
      )}

      {isBelowMin && minPrice !== null && (
        <MinOrderNotice minPrice={minPrice} total={total} className="mb-3" />
      )}

      <Button
        variant="primary-solid"
        size="primaryWide"
        onClick={onContinue}
        disabled={isPending || total <= 0 || isBelowMin}
      >
        {t("checkout")} · {formatPrice(total)} {t("sum")}
      </Button>
    </div>
  );
};

export { CartFooter };

export default CartFooter;
