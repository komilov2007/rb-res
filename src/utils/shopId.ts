import { isServer } from "./is-server";

export const getIds = () => {
  if (!isServer()) {
    const url = window.location.pathname;
    const segments = url.split("/").filter(Boolean);

    if (segments.length >= 2) {
      const langSegment = segments[0]?.match(/^(uz|ru|en|tr)$/);
      const hasLang = Boolean(langSegment);
      const chatSegment = hasLang ? segments[1] : segments[0];
      const shopSegment = hasLang ? segments[2] : segments[1];

      return {
        SHOP_ID: shopSegment,
        CHAT_ID: chatSegment,
        CART_ID: `${shopSegment}_cart`,
      };
    }
  }

  return {
    SHOP_ID: undefined,
    CHAT_ID: undefined,
    CART_ID: undefined,
  };
};
