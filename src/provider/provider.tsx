import { Suspense } from "react";
import { NextIntlClientProvider } from "next-intl";
import Script from "next/script";
import { Toaster } from "sonner";

import CartDrawer from "@/app/[page]/cart";
import { ReactQuery } from "@/provider/react-query";
import { GeneralProvider } from "@/provider/general";
import { AuthProvider } from "@/provider/auth";
import { ProfileProvider } from "@/provider/profile";
import { CartProvider } from "@/provider/cart";
import LoginModal from "@/components/modal/login-modal";
import SignupModal from "@/components/modal/signup-modal";
import LocationModal from "@/components/modal/location-modal";
import ShopClosedModal from "@/components/modal/shop-closed-modal";

import { cn } from "@/lib/utils";
import { getMessages } from "@/utils/i18n";
import { onest } from "@/utils/fonts";
import type { ChildrenProps } from "@/types/children";
import type { LocaleProps } from "@/types/i18n";

type ProviderProps = ChildrenProps & {
  locale: LocaleProps;
};

export const Provider = async ({ locale, children }: ProviderProps) => {
  const messages = await getMessages(locale);

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
              <GeneralProvider>
                <AuthProvider>
                  <CartProvider>
                    <ProfileProvider>
                      <div>
                        {children}
                        <CartDrawer />
                        <LoginModal />
                        <SignupModal />
                        <Suspense fallback={null}>
                          <LocationModal />
                        </Suspense>
                        <ShopClosedModal />
                        {/* richColors: gives toast.success/toast.error their
                            green/red backgrounds — without it every toast
                            renders in sonner's plain default style regardless
                            of variant. offset: guarantees real breathing room
                            from the viewport edge (16-24px) instead of
                            whatever sonner's own default margin resolves to,
                            which is what was letting toasts render partly
                            off-screen. */}
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



