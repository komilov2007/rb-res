import {
  ClipboardList,
  Home,
  LayoutGrid,
  ShoppingCart,
  User,
} from "lucide-react";
export const navItems = [
  {
    key: "menu",
    label: "menu",
    icon: Home,
    active: true,
  },
  {
    key: "category",
    label: "category",
    icon: LayoutGrid,
    active: false,
  },
  {
    key: "cart",
    label: "cart",
    icon: ShoppingCart,
    active: false,
  },
  {
    key: "order",
    label: "order",
    icon: ClipboardList,
    active: false,
  },
  {
    key: "profile",
    label: "profile",
    icon: User,
    active: false,
  },
];
