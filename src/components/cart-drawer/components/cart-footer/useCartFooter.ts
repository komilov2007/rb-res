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

    if (total <= 0) return;

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
