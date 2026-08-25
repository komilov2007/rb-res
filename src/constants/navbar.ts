import { Home, ShoppingCart, User } from "lucide-react";
export const navItems = [
  {
    key: "menu",
    label: "menu",
    icon: Home,
    active: true,
  },
  {
    key: "cart",
    label: "cart",
    icon: ShoppingCart,
    active: false,
  },
  {
    key: "profile",
    label: "profile",
    icon: User,
    active: false,
  },
];
