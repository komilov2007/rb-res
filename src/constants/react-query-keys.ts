// Centralized query keys, per AGENTS.md Section 9. The order/checkout
// feature predates this convention and still uses inline arrays
// (["branches", shopid], etc.) — left as-is, out of scope here. This file
// starts with only what the my-orders/order-placing feature needs; existing
// features migrate to it incrementally, not as part of this step.
export const REACT_QUERY_KEYS = {
  MY_ORDERS: "my-orders",
  ORDER_DETAIL: "order-detail",
  ACTIVE_ORDERS_COUNT: "active-orders-count",
  CART_DELIVERY_CALCULATION: "cart-delivery-calculation",
} as const;
