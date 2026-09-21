"use client";

import { useEffect, useState } from "react";
import { useForm, useWatch, type Resolver } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { useBranchSelection } from "@/app/[page]/components/branch-selection";
import { useLocationStore } from "@/stores/location";
import { useAuthStore } from "@/stores/auth";
import { useCartStore } from "@/stores/cart";
import { useShopStatusStore } from "@/stores/shop-status";
import { useShopid } from "@/hooks/useShopId";
import { useGeneral } from "@/hooks/useGeneral";
import { useProfile } from "@/hooks/useProfile";
import { getBranches, getNearestBranch } from "@/apis/branches";
import { getAddresses } from "@/apis/address";
import { getCartTotal } from "@/utils/cart";
import {
  createOrder,
  getDeliveryCalculation,
  getPaymentToken,
  type CreateOrderPayload,
  type CreateOrderResponse,
} from "@/apis/order";
import { ROUTER } from "@/constants/router";
import {
  PRICED_DELIVERY_TYPES,
  isPickupType,
  isProviderDelivery,
  isServiceDelivery,
} from "@/constants/delivery-type";
import type { DeliveryType, OrderFormValues } from "@/types/order";
import { getApiErrorMessage } from "@/utils/api-error";
import { orderSchema } from "./schema";
import { useAddressDeliverable } from "./useAddressDeliverable";
import { getAvailableServices } from "./components/delivery-type/constants";
import {
  createTelegramInvoiceLink,
  openPaymentLink,
  openTelegramInvoice,
} from "@/lib/telegram";

// delivery_type starts empty: it's set to the first service the shop offers
// (general.services) once general data is available — see the effect below.
const defaultValues: OrderFormValues = {
  delivery_type: null,
  payment_type: null,
  branch: null,
  address: null,
  room: null,
  floor: null,
  entrance: null,
  comment: null,
  spend_cashback: false,
  promocode_id: null,
  promocode: null,
  total: null,
  shipping_date: null,
  shipping_time: null,
  delivery_price: null,
  delivery_price_type: null,
};

// Payment types that finish in an external payment page via createOrder's
// url.url redirect.
const ONLINE_PAYMENT_TYPES = [
  "PAYME_API",
  "CLICK_API",
  "ROBO_CLICK",
  "ROBO_PAYME",
  "ROBO_UZUM",
];

const ONLINE_PAYMENT_TYPE_NAMES: Record<string, string> = {
  PAYME_API: "Payme",
  CLICK_API: "Click",
  ROBO_CLICK: "Click",
  ROBO_PAYME: "Payme",
  ROBO_UZUM: "Uzum",
};

// Group B — these go through the Telegram invoice flow (token -> Telegram
// Bot API createInvoiceLink -> openInvoice) instead of createOrder's own
// url.url redirect. Everything else that isn't in ONLINE_PAYMENT_TYPES
// (Group C) is Group A — direct createOrder, no redirect, no invoice.
const TELEGRAM_INVOICE_PAYMENT_TYPES = ["CLICK", "PAYME"] as const;

type TelegramInvoicePaymentType =
  (typeof TELEGRAM_INVOICE_PAYMENT_TYPES)[number];

const isTelegramInvoicePaymentType = (
  value: string,
): value is TelegramInvoicePaymentType =>
  (TELEGRAM_INVOICE_PAYMENT_TYPES as readonly string[]).includes(value);

const buildShippingDatetime = (date: string | null, time: string | null) => {
  if (!date || !time) return null;

  return `${date}T${time}:00`;
};

// The backend has returned `url: null` when a provider isn't enabled for the
// shop — anything that isn't a real absolute http(s) link can't be opened.
const isValidPaymentUrl = (url?: string | null): url is string => {
  if (!url) return false;

  try {
    const { protocol, hostname } = new URL(url);

    return (
      (protocol === "https:" || protocol === "http:") && hostname.includes(".")
    );
  } catch {
    return false;
  }
};

const toDeliveryPrice = (value: number | string | null | undefined) => {
  if (value === null || value === undefined || value === "") return null;

  const price = Number(value);

  return Number.isNaN(price) ? null : price;
};

type UnavailableState = {
  ids: number[];
  // Unavailability is reported for a specific service/branch — once either
  // changes the ids no longer apply.
  deliveryType: DeliveryType | null;
  branch: number | null;
};

export const usePage = () => {
  const router = useRouter();
  const t = useTranslations();
  const { shopid, hasShopId } = useShopid();
  const { data: general, refetch: refetchGeneral } = useGeneral();
  const openClosedModal = useShopStatusStore((state) => state.openClosedModal);
  const { data: profile } = useProfile();
  // The shared pickup branch (home selector, header chip, product
  // availability) mirrored into the form — see the sync effect below. The
  // order page's own branch picker writes back to that same store rather
  // than only to the form, so this stays the single source of truth.
  // Already null whenever home isn't actually in PICKUP mode
  // (useBranchSelection's own logic).
  const { branchId: homeBranchId } = useBranchSelection();
  const addressId = useLocationStore((state) => state.addressId);
  const storeAddress = useLocationStore((state) => state.address);
  const latitude = useLocationStore((state) => state.latitude);
  const longitude = useLocationStore((state) => state.longitude);
  const customerId = useAuthStore((state) => state.auth?.customer);
  const carts = useCartStore((state) => state.carts);
  const cartCount = useCartStore((state) => state.cartCount);
  const clearCart = useCartStore((state) => state.clearCart);

  const [unavailable, setUnavailable] = useState<UnavailableState | null>(
    null,
  );
  const [isUnavailableModalOpen, setIsUnavailableModalOpen] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  // Covers the token-fetch/invoice/openInvoice steps of the Telegram invoice
  // flow (Group B), which happen before createOrder is ever called, so
  // createOrderMutation.isPending alone doesn't cover the whole submit.
  const [isTelegramSubmitting, setIsTelegramSubmitting] = useState(false);

  const form = useForm<OrderFormValues>({
    mode: "onChange",
    // yup's `.required()` narrows nullable fields to non-null in its inferred
    // type, which doesn't match OrderFormValues allowing `null` before the
    // user picks a value. The runtime validation behavior is unaffected.
    resolver: yupResolver(orderSchema) as Resolver<OrderFormValues>,
    defaultValues,
  });

  const deliveryType = useWatch({ control: form.control, name: "delivery_type" });
  const branch = useWatch({ control: form.control, name: "branch" });
  const addressValue = useWatch({ control: form.control, name: "address" });
  const deliveryPrice = useWatch({
    control: form.control,
    name: "delivery_price",
  });
  const deliveryPriceType = useWatch({
    control: form.control,
    name: "delivery_price_type",
  });
  const spendCashback = useWatch({
    control: form.control,
    name: "spend_cashback",
  });
  const promoTotal = useWatch({ control: form.control, name: "total" });

  const availableServices = getAvailableServices(general?.data?.services);
  const selectedService = availableServices.find(
    (service) => service.type === deliveryType,
  );
  const isDelivery = isServiceDelivery(deliveryType);
  const isProvider = isProviderDelivery(deliveryType);

  // Cart item ids createOrder reported unavailable for the current
  // service/branch — excluded from `items` and subtracted from the total.
  const unavailableItemIds =
    unavailable &&
    unavailable.deliveryType === deliveryType &&
    unavailable.branch === branch
      ? unavailable.ids
      : [];

  const cartTotal = getCartTotal(carts);
  const unavailableTotal = getCartTotal(
    carts.filter(
      (item) =>
        typeof item.id === "number" && unavailableItemIds.includes(item.id),
    ),
  );
  // Delivery is only charged for address deliveries with a FIXED/FLEXABLE
  // delivery price type.
  const orderDeliveryPrice =
    isDelivery &&
    typeof deliveryPrice === "number" &&
    PRICED_DELIVERY_TYPES.includes(deliveryPriceType ?? "")
      ? deliveryPrice
      : 0;
  // Display only — the backend deducts the balance itself from the
  // spend_cashback flag.
  const cashbackBall =
    general?.data?.cashback_enabled && spendCashback
      ? (profile?.data.cashback_ball ?? 0)
      : 0;
  const appliedPromoTotal = typeof promoTotal === "number" ? promoTotal : null;
  // A promo replaces the cart total with the backend's discounted
  // total_amount; the undiscounted price is then shown struck through.
  const oldPrice =
    appliedPromoTotal !== null ? cartTotal + orderDeliveryPrice : null;
  // Must match the amount charged via the Telegram invoice.
  const displayTotal = Math.max(
    0,
    (appliedPromoTotal ?? cartTotal) +
      orderDeliveryPrice -
      unavailableTotal -
      cashbackBall,
  );

  const branchesQuery = useQuery({
    enabled: hasShopId,
    queryKey: ["branches", shopid],
    queryFn: () => getBranches(shopid as string),
  });

  const addressesQuery = useQuery({
    enabled: Boolean(customerId),
    queryKey: ["user-addresses", customerId],
    queryFn: getAddresses,
  });

  const addresses = addressesQuery.data?.data ?? [];
  const activeAddress =
    addresses.find((item) => item.id === addressId) ??
    addresses.find((item) => item.address === storeAddress) ??
    addresses.find((item) => item.is_current) ??
    addresses[0] ??
    null;

  // Same query/key the address section runs — here only to block submit.
  const { isAllowed: isAddressDeliverable } = useAddressDeliverable(
    deliveryType,
    addresses.find((item) => item.id === addressValue) ?? null,
  );

  const nearestBranchQuery = useQuery({
    enabled:
      hasShopId && isDelivery && Boolean(latitude) && Boolean(longitude),
    queryKey: ["nearest-branch", shopid, latitude, longitude],
    queryFn: () =>
      getNearestBranch({
        shopid: shopid as string,
        latitude: latitude as number,
        longitude: longitude as number,
      }),
  });

  const deliveryCalculationQuery = useQuery({
    enabled:
      hasShopId &&
      Boolean(customerId) &&
      isDelivery &&
      cartTotal > 0 &&
      // Without a selected address the backend answers "Customer does not
      // have a current address set." — the address section already asks
      // for one, so no request (and no error toast) until it's picked.
      addressValue !== null &&
      (!isProvider || (Boolean(latitude) && Boolean(longitude))),
    // The address is part of the key, so changing it recalculates the
    // delivery price.
    queryKey: [
      "delivery-calculation",
      shopid,
      customerId,
      deliveryType,
      addressValue,
      latitude,
      longitude,
      cartTotal,
    ],
    queryFn: () =>
      getDeliveryCalculation(customerId as number, shopid as string, {
        total_amount: cartTotal,
        ...(isProvider
          ? {
              service_type: deliveryType as string,
              latitude: latitude ?? undefined,
              longitude: longitude ?? undefined,
            }
          : {}),
      }),
  });

  // Select the first offered service until the user picks one (or when the
  // selected one isn't offered by this shop).
  const firstServiceType = availableServices[0]?.type ?? null;
  const isSelectedServiceAvailable = Boolean(selectedService);

  useEffect(() => {
    if (isSelectedServiceAvailable || !firstServiceType) return;

    form.setValue("delivery_type", firstServiceType, { shouldValidate: true });
  }, [firstServiceType, isSelectedServiceAvailable, form]);

  // Payment methods, the delivery price and the shipping time all depend on
  // the selected service type, so they're cleared whenever it changes. No
  // `shouldValidate` on payment_type: the payment section hasn't necessarily
  // loaded yet, so flagging it invalid immediately would show an error
  // before the user has even seen the options — it still validates on submit.
  useEffect(() => {
    form.setValue("payment_type", null);
    form.setValue("delivery_price", null);
    form.setValue("delivery_price_type", null);
    form.setValue("shipping_date", null);
    form.setValue("shipping_time", null);
    form.clearErrors(["shipping_date", "shipping_time"]);
  }, [deliveryType, form]);

  // Autofill the delivery fields from the active saved address.
  useEffect(() => {
    if (!isDelivery) return;

    form.setValue("address", activeAddress?.id ?? null, {
      shouldValidate: true,
    });
    form.setValue("comment", activeAddress?.comment ?? null);
    form.setValue("floor", activeAddress?.floor ?? null);
    form.setValue("room", activeAddress?.room ?? null);
    form.setValue("entrance", activeAddress?.entrance ?? null);
  }, [
    isDelivery,
    activeAddress?.id,
    activeAddress?.comment,
    activeAddress?.floor,
    activeAddress?.room,
    activeAddress?.entrance,
    form,
  ]);

  // Keeps the form's branch equal to the shared selection. Picking a branch
  // in this page's own picker (src/app/order/components/branches) calls
  // setPickup, so homeBranchId changes and this effect re-applies the same
  // value — one direction of sync, no fight between the two. homeBranchId is
  // already null whenever home isn't actually in PICKUP mode
  // (useBranchSelection's own logic), so this only needs to gate on the
  // order's *own* delivery type being a pickup one.
  useEffect(() => {
    if (!isPickupType(deliveryType)) return;

    form.setValue("branch", homeBranchId, { shouldValidate: true });
  }, [deliveryType, homeBranchId, form]);

  // deliveryType is a dependency so a cached calculation is re-applied after
  // the reset effect above clears it on a service type change.
  useEffect(() => {
    const data = deliveryCalculationQuery.data?.data;

    if (!data) return;

    form.setValue("delivery_price", toDeliveryPrice(data.delivery));
    form.setValue("delivery_price_type", data.delivery_type);
  }, [deliveryCalculationQuery.data, deliveryType, form]);

  const createOrderMutation = useMutation({
    mutationFn: (payload: CreateOrderPayload) => createOrder(payload),
    onError: (error) => {
      setSubmitError(
        getApiErrorMessage(error, t("order_page_errors_create_failed")),
      );
    },
  });

  // Only active cart lines, minus the ones reported unavailable.
  const buildItems = () =>
    carts.flatMap((item) =>
      item.is_active &&
      typeof item.id === "number" &&
      !unavailableItemIds.includes(item.id)
        ? [item.id]
        : [],
    );

  // Group A (direct payment types) and Group B (after a paid Telegram
  // invoice) both land here once the order is actually created. Always
  // navigates in-app to the real order-placing/invoice page (STEP 28); only
  // an explicit "Done" action from that page closes the Mini App.
  const finishOrder = (order: number) => {
    router.push(
      `${ROUTER.ORDER_PLACING}/${order}${shopid ? `?shop_id=${shopid}` : ""}`,
    );
  };

  const goHome = () => {
    router.push(`${ROUTER.HOME}${shopid ? `?shop_id=${shopid}` : ""}`);
  };

  const handleCreateOrderResponse = (
    data: CreateOrderResponse,
    values: OrderFormValues,
  ) => {
    if (data.unavailable_products && data.unavailable_products.length > 0) {
      // The order doesn't proceed: the user either changes the branch or
      // goes back to the cart; a resubmit excludes these items.
      setUnavailable({
        ids: [...unavailableItemIds, ...data.unavailable_products],
        deliveryType: values.delivery_type,
        branch: values.branch,
      });
      setIsUnavailableModalOpen(true);
      return;
    }

    // The backend consumes the cart the moment createOrder succeeds,
    // regardless of payment type — clearing the local store keeps the home
    // page's cart badge correct immediately.
    clearCart();

    const paymentType = values.payment_type;

    if (paymentType && ONLINE_PAYMENT_TYPES.includes(paymentType)) {
      if (!data.url || !isValidPaymentUrl(data.url.url)) {
        const name = ONLINE_PAYMENT_TYPE_NAMES[paymentType] ?? paymentType;

        toast.error(t("order_page_errors_provider_disabled", { name }));
        goHome();
        return;
      }

      const query = new URLSearchParams({
        orderId: String(data.url.order_id),
        url: data.url.url,
        paymentType,
      });

      if (data.url.external_id) {
        query.set("externalId", data.url.external_id);
      }

      // Without this, the /order page useOrderStatus lands on next loses
      // shop_id the instant this redirect happens (useShopid() re-reads
      // useSearchParams() fresh every render) — which then also makes its
      // own later router.push to ORDER_PLACING carry an empty shopid.
      if (shopid) {
        query.set("shop_id", shopid);
      }

      router.push(`${ROUTER.ORDER}?${query.toString()}`);
      openPaymentLink(data.url.url);
      return;
    }

    finishOrder(data.order);
  };

  // Group B: token -> Telegram Bot API createInvoiceLink -> openInvoice ->
  // only createOrder (via handleCreateOrderResponse -> finishOrder) once the
  // invoice actually comes back paid.
  const submitViaTelegramInvoice = async (
    paymentType: TelegramInvoicePaymentType,
    payload: CreateOrderPayload,
    values: OrderFormValues,
  ) => {
    setIsTelegramSubmitting(true);

    try {
      const tokenResponse = await getPaymentToken(shopid as string, paymentType);
      const { bot_token, payment } = tokenResponse.data;

      const invoice = await createTelegramInvoiceLink(bot_token, {
        title: t("order_page_invoice_title"),
        description: "Test description",
        payload: "custom_payload",
        provider_token: payment.token,
        currency: "UZS",
        prices: [{ label: t("total"), amount: Math.round(displayTotal * 100) }],
      });

      if (!invoice.ok || !invoice.result) {
        setSubmitError(t("order_page_errors_payment_link_failed"));
        return;
      }

      const status = await openTelegramInvoice(invoice.result);

      if (status !== "paid") {
        setSubmitError(t("order_page_errors_payment_failed"));
        return;
      }

      const response = await createOrderMutation.mutateAsync(payload);

      handleCreateOrderResponse(response.data, values);
    } finally {
      setIsTelegramSubmitting(false);
    }
  };

  const onSubmit = form.handleSubmit(async (values) => {
    if (!customerId || !shopid) return;

    setSubmitError(null);

    // Fresh is_open, not the cached one — the shop may have closed since
    // this page loaded. Same closed-shop modal the cart's checkout opens.
    const { data: freshGeneral } = await refetchGeneral();

    if (freshGeneral?.data.is_open === false) {
      openClosedModal();
      return;
    }

    const isDeliveryOrder = isServiceDelivery(values.delivery_type);

    // The message itself is shown only in the address section.
    if (isDeliveryOrder && !isAddressDeliverable) return;

    const nearBranch = isDeliveryOrder
      ? (nearestBranchQuery.data?.data.id ?? null)
      : values.branch;
    const service = availableServices.find(
      (item) => item.type === values.delivery_type,
    );

    const orderItems = buildItems();

    if (orderItems.length === 0) {
      toast.error(t("order_page_errors_cart_empty"));
      return;
    }

    const payload: CreateOrderPayload = {
      spend_cashback: values.spend_cashback,
      near_branch: nearBranch,
      shop: shopid,
      customer: Number(customerId),
      platform: "TELEGRAM",
      branch: values.branch,
      payment_type: values.payment_type as string,
      service_type: values.delivery_type as string,
      is_paid: false,
      promo_code: values.promocode_id ?? undefined,
      items: orderItems,
      // Only services with shipping_time accept a scheduled time.
      shipping_datetime: service?.shipping_time
        ? buildShippingDatetime(values.shipping_date, values.shipping_time)
        : null,
      // No source for this flag exists in rb-restaurant yet — nothing records
      // whether the Mini App was opened from the Telegram menu button.
      is_menu_button: false,
    };

    if (isDeliveryOrder && values.address !== null) {
      payload.address = {
        address: values.address,
        room: values.room,
        floor: values.floor,
        entrance: values.entrance,
        comment: values.comment,
      };
    }

    if (values.payment_type && isTelegramInvoicePaymentType(values.payment_type)) {
      await submitViaTelegramInvoice(values.payment_type, payload, values);
      return;
    }

    const response = await createOrderMutation.mutateAsync(payload);

    handleCreateOrderResponse(response.data, values);
  });

  const closeUnavailableModal = () => {
    setIsUnavailableModalOpen(false);
  };

  return {
    form,
    branches: branchesQuery.data?.data,
    isBranchesLoading: branchesQuery.isLoading,
    isBranchesError: branchesQuery.isError,
    // Branch working hours aren't per-branch — they come from the shop-wide
    // schedule already fetched here (same field src/utils/banner.ts already
    // reads for the "today's hours" banner text).
    workingTime: general?.data?.working_time,
    availableServices,
    hasShippingTime: Boolean(selectedService?.shipping_time),
    cashbackEnabled: general?.data?.cashback_enabled === true,
    onSubmit,
    isSubmitting: createOrderMutation.isPending || isTelegramSubmitting,
    unavailableItemIds,
    isUnavailableModalOpen,
    closeUnavailableModal,
    cartCount,
    cartTotal,
    deliveryPrice: orderDeliveryPrice,
    promoTotal: appliedPromoTotal,
    unavailableTotal,
    cashbackBall,
    oldPrice,
    displayTotal,
    submitError,
  };
};
