"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Button from "@/components/ui/button";
import { ROUTER } from "@/constants/router";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useShopId } from "@/hooks/useShopId";
import { useCartStore } from "@/stores/cart";

type UnavailableModalProps = {
  open: boolean;
  unavailableItemIds: number[];
  onClose: () => void;
};

const UnavailableModal = ({
  open,
  unavailableItemIds,
  onClose,
}: UnavailableModalProps) => {
  const t = useTranslations();
  const router = useRouter();
  const { shopid } = useShopId();
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const openCartModal = useCartStore((state) => state.openCartModal);
  const setUnavailableItemIds = useCartStore(
    (state) => state.setUnavailableItemIds,
  );

  // The cart drawer is mounted globally (provider.tsx), so it stays open
  // across the navigation home and can mark the unavailable items.
  const handleBackToCart = () => {
    onClose();
    setUnavailableItemIds(unavailableItemIds);
    router.push(`${ROUTER.HOME}${shopid ? `?shop_id=${shopid}` : ""}`);
    openCartModal(isDesktop ? "desktop" : "mobile");
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle className="text-center font-normal leading-snug">
            {t("unavailable_products_hint")}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {t("unavailable_products_title")}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex-row border-t-0 bg-white">
          <Button
            type="button"
            variant="outline"
            size="dialogAction"
            onClick={onClose}
          >
            {t("choose_another_branch")}
          </Button>
          <Button
            type="button"
            variant="primary-solid"
            size="dialogAction"
            onClick={handleBackToCart}
          >
            {t("back_to_cart")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UnavailableModal;
