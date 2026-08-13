"use client";

import { Loader } from "@/components/ui/loader";
import { useGeneral } from "@/hooks/useGeneral";
import Footer from "./components/footer";
import Header from "./components/header";
import Banner from "./components/banner";
import Categories from "./components/categories";
import Products from "./components/products";

const Home = () => {
  const { isLoading } = useGeneral();

  return (
    <div className="min-h-screen bg-gray10">
      <Header />
      {isLoading ? (
        <div className="flex min-h-[calc(100vh-146px)] items-center justify-center bg-white">
          <Loader />
        </div>
      ) : (
        <>
          <div className="overflow-hidden rounded-bl-[30px] rounded-br-[30px] bg-white py-5">
            <Banner />
            <Categories />
          </div>
          <div className="h-2" />
          <div className="rounded-[30px] bg-white">
            <Products />
          </div>
          <div className="h-2" />
        </>
      )}
      <Footer />
    </div>
  );
};

export default Home;
