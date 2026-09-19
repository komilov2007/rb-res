import type { ReactNode } from "react";

import BranchSelectionModal from "@/app/[page]/components/branch-selection/branch-selection-modal";
import FloatingCart from "@/app/[page]/components/floating-cart";
import Footer from "@/app/[page]/components/footer";
import Header from "@/app/[page]/components/header";
import MobileAction from "@/app/[page]/components/mobile/mobile-action";
import MobileFooter from "@/app/[page]/components/mobile/mobile-footer";
import ProductBranchPicker from "@/components/modal/product-branch-picker";
import ProductDetailMobile from "@/components/modal/product-detail";

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
      <ProductDetailMobile />
      {/* Mounted once here — the header chip is rendered by both the
          desktop and mobile headers, so it can't own the modal. */}
      <BranchSelectionModal />
      {/* Mounted once here too, for the same reason — triggered from any
          unavailable product card or the detail modal, both of which can
          appear on several different pages. */}
      <ProductBranchPicker />
    </div>
  );
};

export default PageLayout;
