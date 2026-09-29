import MyOrders from ".";
import DesktopOrdersRedirect from "@/components/desktop-orders-redirect";

const Page = () => (
  <DesktopOrdersRedirect>
    <MyOrders />
  </DesktopOrdersRedirect>
);

export default Page;
