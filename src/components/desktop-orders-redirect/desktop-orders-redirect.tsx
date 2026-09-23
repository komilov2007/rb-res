"use client";

import {
  type ReactNode,
  Suspense,
  useEffect,
  useSyncExternalStore,
} from "react";
import { useParams, useRouter } from "next/navigation";

import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useShopId } from "@/hooks/useShopId";
import { getProfileOrdersUrl } from "@/utils/orders";

const subscribeNoop = () => () => {};

type DesktopOrdersRedirectProps = {
  children: ReactNode;
  // Open this route's [order] card in the profile list.
  withOrder?: boolean;
};

// Mobile keeps the standalone order pages (/my-orders, /my-orders/[id],
// /order-placing/[id]); on desktop "Buyurtmalarim" lives only in the
// profile, so these routes forward there.
const Redirect = ({ children, withOrder = false }: DesktopOrdersRedirectProps) => {
  const router = useRouter();
  const params = useParams<{ order?: string }>();
  const { shopid } = useShopId();
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  // useMediaQuery is false on the server/hydration render — wait until the
  // client has taken over so desktop never mounts the mobile page (and its
  // queries) for a frame before redirecting.
  const isHydrated = useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );
  const orderId = withOrder ? (params.order ?? null) : null;

  useEffect(() => {
    if (isDesktop) router.replace(getProfileOrdersUrl(shopid, orderId));
  }, [isDesktop, orderId, router, shopid]);

  if (!isHydrated || isDesktop) return null;

  return children;
};

// useSearchParams (shop_id) needs a Suspense boundary.
const DesktopOrdersRedirect = (props: DesktopOrdersRedirectProps) => (
  <Suspense>
    <Redirect {...props} />
  </Suspense>
);

export default DesktopOrdersRedirect;
