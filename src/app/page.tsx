import { memo, Suspense } from "react";
import Home from "./[page]/home";

const Page = () => {
  return (
    <Suspense>
      <Home />
    </Suspense>
  );
};

export default memo(Page);
