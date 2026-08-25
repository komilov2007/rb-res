import type { ReactNode } from "react";

import FloatingCart from "@/app/[page]/components/floating-cart";
import Footer from "@/app/[page]/components/footer";
import Header from "@/app/[page]/components/header";
import MobileAction from "@/app/[page]/components/mobile/mobile-action";
import MobileFooter from "@/app/[page]/components/mobile/mobile-footer";

type PageLayoutProps = {
  children: ReactNode;
  showFloatingCart?: boolean;
};

const PageLayout = ({ children, showFloatingCart }: PageLayoutProps) => {
  return (
    <div className="min-h-screen bg-gray10 pb-[74px] lg:pb-0">
      <Header />
      <main className="bg-gray10">{children}</main>
      <div className="h-3 bg-gray10" />
      <Footer />
      {showFloatingCart && <FloatingCart />}
      <MobileAction />
      <MobileFooter />
    </div>
  );
};

export default PageLayout;
