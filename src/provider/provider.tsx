import { Suspense } from "react";
import { headers } from "next/headers";
import { NextIntlClientProvider } from "next-intl";
import Script from "next/script";
import { Toaster } from "sonner";

import CartDrawer from "@/components/cart-drawer";
import { ReactQuery } from "@/provider/react-query";
import { GeneralProvider } from "@/provider/general";
import { AuthProvider } from "@/provider/auth";
import { ProfileProvider } from "@/provider/profile";
import { CartProvider } from "@/provider/cart";
import { ThemeSync } from "@/provider/theme";
import LoginModal from "@/components/modal/login-modal";
import SignupModal from "@/components/modal/signup-modal";
import LocationModal from "@/components/modal/location-modal";
import ShopClosedModal from "@/components/modal/shop-closed-modal";
import ChatModal from "@/components/chat-modal";

import { cn } from "@/utils/cn";
import { getMessages } from "@/utils/i18n";
import { onest } from "@/utils/fonts";
import type { ChildrenProps } from "@/types/children";
import type { LocaleProps } from "@/types/i18n";

type ProviderProps = ChildrenProps & {
  locale: LocaleProps;
};

export const Provider = async ({ locale, children }: ProviderProps) => {
  const messages = await getMessages(locale);
  const clickToken = (await headers()).get("web-session");

  return (
    <html lang={locale} className={cn(onest.variable, onest.className)}>
      <body>
        <Script
          src="https://telegram.org/js/telegram-web-app.js"
          strategy="afterInteractive"
        />
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ReactQuery>
            <Suspense>
              <GeneralProvider clickToken={clickToken}>
                <AuthProvider>
                  <CartProvider>
                    <ProfileProvider>
                      <div>
                        {children}
                        <ThemeSync />
                        <CartDrawer />
                        <LoginModal />
                        <SignupModal />
                        <Suspense fallback={null}>
                          <LocationModal />
                        </Suspense>
                        <ShopClosedModal />
                        <Suspense fallback={null}>
                          <ChatModal />
                        </Suspense>
                        <Toaster
                          position="top-right"
                          closeButton
                          richColors
                          offset="20px"
                        />
                      </div>
                    </ProfileProvider>
                  </CartProvider>
                </AuthProvider>
              </GeneralProvider>
            </Suspense>
          </ReactQuery>
        </NextIntlClientProvider>
      </body>
    </html>
  );
};
