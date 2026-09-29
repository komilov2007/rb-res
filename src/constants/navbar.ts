import { IconClipboardListFilled, IconHomeFilled, IconLayoutGridFilled, IconShoppingCartFilled, IconUserFilled } from "@tabler/icons-react";

export const navItems = [
  {
    key: "menu",
    label: "menu",
    icon: IconHomeFilled,
    active: true,
  },
  {
    key: "category",
    label: "category",
    icon: IconLayoutGridFilled,
    active: false,
  },
  {
    key: "cart",
    label: "cart",
    icon: IconShoppingCartFilled,
    active: false,
  },
  {
    key: "order",
    label: "order",
    icon: IconClipboardListFilled,
    active: false,
  },
  {
    key: "profile",
    label: "profile",
    icon: IconUserFilled,
    active: false,
  },
];
