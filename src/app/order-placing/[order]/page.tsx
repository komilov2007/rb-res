import OrderPlacing from ".";
import DesktopOrdersRedirect from "@/components/desktop-orders-redirect";

const Page = () => (
  <DesktopOrdersRedirect withOrder>
    <OrderPlacing />
  </DesktopOrdersRedirect>
);

export default Page;
