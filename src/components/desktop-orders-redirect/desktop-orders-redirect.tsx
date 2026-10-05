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
  withOrder?: boolean;
};

const Redirect = ({ children, withOrder = false }: DesktopOrdersRedirectProps) => {
  const router = useRouter();
  const params = useParams<{ order?: string }>();
  const { shopid } = useShopId();
  const isDesktop = useMediaQuery("(min-width: 1024px)");
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

const DesktopOrdersRedirect = (props: DesktopOrdersRedirectProps) => (
  <Suspense>
    <Redirect {...props} />
  </Suspense>
);

export default DesktopOrdersRedirect;
