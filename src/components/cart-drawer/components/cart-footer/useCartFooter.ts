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

// rb-restaurant currently only operates as RESTAURANT. The SHOP branch is kept
// so the flow matches rb-shop's architecture; wire the real business-type
// source here once rb-restaurant exposes one (STEP 2).
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
    // The cart drawer is mounted globally (not scoped to this page), so
    // without this it stays open on top of /order — same close-then-navigate
    // order used elsewhere (e.g. unavailable-modal.tsx's handleBackToCart).
    closeCartModal();
    setSelectionModal(false);
    router.push(`${ROUTER.ORDER}${shopid ? `?shop_id=${shopid}` : ""}`);
  };

  const handleContinue = async () => {
    // Checked first, before login/name/selection — placing an order is
    // pointless while the shop itself is closed, whatever else is missing.
    // Refetched so a shop that closed after the page loaded is caught too.
    const freshGeneral = shopid ? (await refetchGeneral()).data : undefined;

    if ((freshGeneral ?? general)?.data.is_open === false) {
      closeCartModal();
      openClosedModal();
      return;
    }

    if (!hasAccess) {
      // The cart drawer is mounted globally, same as goToOrder's own issue
      // above — without closing it first, the login modal opens stacked on
      // top of a still-open drawer instead of being the only overlay.
      closeCartModal();
      setPendingCheckout(true);
      setLoginModal(true);
      return;
    }

    // Logged in but no name yet (e.g. the name step was dismissed): ask for
    // it on the current screen; checkout resumes once it's saved.
    if (!hasFirstname) {
      closeCartModal();
      setPendingCheckout(true);
      setSignupModal(true);
      return;
    }

    // Checkout needs a delivery address or pickup branch — checked on every
    // attempt (also after the header chip's X cleared it). Opens the same
    // selection modal; checkout resumes once a choice is made.
    if (!hasSelection) {
      closeCartModal();
      setPendingCheckout(true);
      setSelectionModal(true);
      return;
    }

    // Cart items not sold at the selected branch can't be ordered there.
    // Items whose branch list is unknown (empty) aren't blocked.
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

    // TODO (STEP 2): minimum order amount and address/distance restriction checks.

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

  // Resumes checkout once login succeeds and the user has a name — so a
  // first-time user finishes the name step on the current screen before
  // anything navigates. pendingCheckout is only ever set true by this hook's
  // own branches above, so this can't fire for a login triggered from an
  // unrelated part of the app (e.g. the profile page). Re-running
  // handleContinue (rather than jumping straight to goToOrder) means a
  // still-missing address, an empty cart, etc. get handled the same way a
  // second real tap of "continue" would.
  useEffect(() => {
    if (!hasAccess || !hasFirstname || !hasSelection || !pendingCheckout) {
      return;
    }

    setPendingCheckout(false);
    void handleContinue();
    // handleContinue is intentionally omitted: it's recreated every render,
    // and this should only re-run when the gating values actually change,
    // always using whichever handleContinue is current.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasAccess, hasFirstname, hasSelection, pendingCheckout]);

  return {
    handleContinue,
    isPending: statusMutation.isPending,
  };
};
