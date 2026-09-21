"use client";

import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { useCartStore } from "@/stores/cart";
import { useLocationStore } from "@/stores/location";
import CartBody from "./components/cart-body";
import CartFooter from "./components/cart-footer";
import CartHeader from "./components/cart-header";
import RemoveCartDialog from "./components/trash-dialog";
import { useCartFooter } from "./components/cart-footer/useCartFooter";
import { getCartList } from "@/apis/cart";
import { getDeliveryCalculation } from "@/apis/order";
import { REACT_QUERY_KEYS } from "@/constants/react-query-keys";
import { useAuthStore } from "@/stores/auth";
import { useGeneral } from "@/hooks/useGeneral";
import { useShopId } from "@/hooks/useShopId";
import { getCartTotal, normalizeCartItems } from "@/utils/cart";

const CartDrawer = () => {
  const carts = useCartStore((state) => state.carts);
  const isCartOpen = useCartStore((state) => state.isCartOpen);
  const cartVariant = useCartStore((state) => state.cartVariant);
  const closeCartModal = useCartStore((state) => state.closeCartModal);
  const setCarts = useCartStore((state) => state.setCarts);
  const customerId = useAuthStore((state) => state.auth?.customer);
  const latitude = useLocationStore((state) => state.latitude);
  const longitude = useLocationStore((state) => state.longitude);
  const { shopid, hasShopId } = useShopId();
  const { data: general } = useGeneral();

  const isMobile = cartVariant === "mobile";
  const total = getCartTotal(carts);
  const shopDeliveryService = general?.data?.delivery?.delivery_type;
  const usesProviderDelivery =
    shopDeliveryService === "YANDEX_DELIVERY" ||
    shopDeliveryService === "NOOR_DELIVERY";
  // Lifted up from CartFooter: the cart Sheet's content (and anything
  // inside it) unmounts whenever isCartOpen goes false — including right
  // when handleContinue's !hasAccess branch closes the drawer to show the
  // login modal. useCartFooter's own effect resumes checkout once login
  // succeeds, so it has to live somewhere that survives the drawer being
  // closed — CartDrawer itself, which is always mounted globally.
  const { handleContinue, isPending } = useCartFooter(total);
  const [viewingProductId, setViewingProductId] = useState<number | null>(
    null,
  );
  const viewingItem =
    carts.find((item) => item.product.id === viewingProductId) ?? null;
  const { data: cartItems } = useQuery({
    enabled: isCartOpen && Boolean(customerId),
    queryKey: ["cart-list", customerId],
    queryFn: () => getCartList(customerId as number),
    select: (response) => normalizeCartItems(response.data, carts),
    refetchOnMount: "always",
    staleTime: 0,
  });
  // Delivery price is calculated once per cart opening, not on every
  // counter tap: the total is snapshotted when the drawer opens (or when
  // the first non-empty total shows up) and cleared when it closes.
  const [calculationTotal, setCalculationTotal] = useState<number | null>(
    null,
  );

  if (isCartOpen && calculationTotal === null && total > 0) {
    setCalculationTotal(total);
  }

  if (!isCartOpen && calculationTotal !== null) {
    setCalculationTotal(null);
  }

  const { data: deliveryCalculation } = useQuery({
    enabled:
      isCartOpen &&
      hasShopId &&
      Boolean(customerId) &&
      calculationTotal !== null &&
      (!usesProviderDelivery || (Boolean(latitude) && Boolean(longitude))),
    queryKey: [
      REACT_QUERY_KEYS.CART_DELIVERY_CALCULATION,
      shopid,
      customerId,
      calculationTotal,
      usesProviderDelivery ? shopDeliveryService : null,
      usesProviderDelivery ? latitude : null,
      usesProviderDelivery ? longitude : null,
    ],
    queryFn: () =>
      getDeliveryCalculation(customerId as number, shopid as string, {
        total_amount: calculationTotal as number,
        ...(usesProviderDelivery
          ? {
              service_type: shopDeliveryService,
              latitude: latitude ?? undefined,
              longitude: longitude ?? undefined,
            }
          : {}),
      }),
  });
  const deliveryPrice = Number(deliveryCalculation?.data.delivery ?? 0);

  useEffect(() => {
    if (cartItems) setCarts(cartItems);
  }, [cartItems, setCarts]);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      closeCartModal();
      setViewingProductId(null);
    }
  };

  return (
    <>
      <Sheet open={isCartOpen} onOpenChange={handleOpenChange}>
        <SheetContent
          side={isMobile ? "bottom" : "right"}
          showCloseButton={false}
          className={getSheetClassName(isMobile)}
        >
          <CartHeader
            isMobile={isMobile}
            viewingItem={viewingItem}
            onBack={() => setViewingProductId(null)}
          />
          <CartBody
            isMobile={isMobile}
            viewingItem={viewingItem}
            onView={setViewingProductId}
          />
          {carts.length > 0 && (
            <CartFooter
              isMobile={isMobile}
              total={total}
              deliveryPrice={Number.isNaN(deliveryPrice) ? 0 : deliveryPrice}
              onContinue={handleContinue}
              isPending={isPending}
            />
          )}
        </SheetContent>
      </Sheet>

      <RemoveCartDialog />
    </>
  );
};

const getSheetClassName = (isMobile: boolean) => {
  // h-fit sizes the sheet to its actual content (short carts stay compact);
  // max-h-[80dvh]+overflow-hidden is only a cap for long carts, at which
  // point CartBody's own overflow-y-auto scrolls the item list internally.
  return isMobile
    ? "flex h-fit max-h-[80dvh] w-full flex-col gap-0 overflow-hidden rounded-t-[28px] border-t border-gray180 bg-white p-0"
    : "flex h-full w-[560px] max-w-[560px] flex-col gap-0 border-l border-gray180 bg-white p-0";
};

export default CartDrawer;

