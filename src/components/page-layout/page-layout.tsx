import type { ReactNode } from "react";

import { BranchSelectionModal } from "@/components/branch-selection/branch-selection-modal";
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
      <FloatingCart />
      <MobileAction />
      <MobileFooter />
      <ProductDetailMobile />
      <BranchSelectionModal />
      <ProductBranchPicker />
    </div>
  );
};

export default PageLayout;
