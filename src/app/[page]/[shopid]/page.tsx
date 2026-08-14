import { Suspense } from "react";
import Home from "../home";

const Page = () => {
  return (
    <Suspense>
      <Home />
    </Suspense>
  );
};

export default Page;
