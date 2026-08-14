"use client";

import { Loader } from "@/components/ui/loader";
import { useGeneral } from "@/hooks/useGeneral";
import Footer from "./components/footer";
import Header from "./components/header";
import Banner from "./components/banner";
import Categories from "./components/categories";
import MobileFooter from "./components/mobile-footer";
import HomeModals from "./components/home-modals";
import Products from "./components/products";

const Home = () => {
  const { isLoading } = useGeneral();

  return (
    <div className="min-h-screen bg-gray10 pb-[74px] lg:pb-0">
      <Header />
      {isLoading ? (
        <div className="flex min-h-[calc(100vh-146px)] items-center justify-center bg-white">
          <Loader />
        </div>
      ) : (
        <>
          <section className="rounded-bl-[30px] rounded-br-[30px] bg-white py-0 lg:py-5">
            <Banner />
            <Categories />
          </section>
          <div className="h-3 bg-gray10" />
          <section className="rounded-[30px] bg-white">
            <Products />
          </section>
        </>
      )}
      <div className="h-3 bg-gray10" />
      <Footer />
      <MobileFooter />
      <HomeModals />
    </div>
  );
};

export default Home;
