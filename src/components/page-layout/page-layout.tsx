import type { ReactNode } from "react";

import BranchSelectionModal from "@/components/branch-selection/branch-selection-modal";
import FloatingCart from "@/components/floating-cart";
import Footer from "@/components/footer";
import Header from "@/components/header";
import MobileAction from "@/components/mobile-action";
import MobileFooter from "@/components/mobile-footer";
import ProductBranchPicker from "@/components/modal/product-branch-picker";
import ProductDetailMobile from "@/components/modal/product-detail";

type PageLayoutProps = {
  children: ReactNode;
};

const PageLayout = ({ children }: PageLayoutProps) => {
  return (
    <div className="min-h-screen bg-gray10 pb-[74px] lg:pb-0">
      <Header />
      <main className="bg-gray10">{children}</main>
      <div className="h-2 bg-gray10" />
      <Footer />
      {/* Desktop-only; sits under the Hand action button. */}
      <FloatingCart />
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
