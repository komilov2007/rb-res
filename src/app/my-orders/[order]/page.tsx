import MyOrderDetail from ".";
import DesktopOrdersRedirect from "@/components/desktop-orders-redirect";

const Page = () => (
  <DesktopOrdersRedirect withOrder>
    <MyOrderDetail />
  </DesktopOrdersRedirect>
);

export default Page;
