// Centralized query keys (CLAUDE.md Section 9). Keys are
// [REACT_QUERY_KEYS.DOMAIN, ...dependencies]. The string values are what the
// cache is keyed by — changing one splits the cache between its users.
export const REACT_QUERY_KEYS = {
  GENERAL: "general",
  PROFILE: "profile",
  BANNERS: "banners",
  CATEGORIES: "categories",
  PRODUCTS: "products",
  PRODUCT_DETAIL: "product-detail",
  SEARCH_PRODUCTS: "search-products",
  BRANCHES: "branches",
  NEAREST_BRANCH: "nearest-branch",
  USER_ADDRESSES: "user-addresses",
  CART_LIST: "cart-list",
  CART_DELIVERY_CALCULATION: "cart-delivery-calculation",
  NOTIFICATIONS: "notifications",
  PAYMENT_LIST: "payment-list",
  CHECK_DELIVERY: "check-delivery",
  DELIVERY_CALCULATION: "delivery-calculation",
  ORDER_STATUS: "order-status",
  MY_ORDERS: "my-orders",
  ORDER_DETAIL: "order-detail",
  ORDER_DETAIL_ADDRESS_GEOCODE: "order-detail-address-geocode",
  ACTIVE_ORDERS_COUNT: "active-orders-count",
} as const;
