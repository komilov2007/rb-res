import type { Metadata, Viewport } from "next";

import { Provider } from "@/provider/provider";
import { getLocale } from "@/utils/i18n";
import type { ChildrenProps } from "@/types/children";

import "./globals.css";
export const metadata: Metadata = {
  title: "RB Restaurant",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "RB Restaurant",
  },
};

// viewport-fit=cover lets the page reach under the iOS notch / home bar so
// env(safe-area-inset-*) is reported; layouts pad themselves with --safe-top.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#ffffff",
};

export default async function RootLayout({
  children,
}: Readonly<ChildrenProps>) {
  const locale = await getLocale();

  return <Provider locale={locale}>{children}</Provider>;
}
