import Logo from "@/components/logo";

const Footer = () => {
  return (
    <div className="hidden bg-gray10 lg:block">
      <footer className="flex items-center justify-center rounded-tl-[30px] rounded-tr-[30px] bg-white px-4 pb-[60px] pt-10">
        <div className="flex w-full max-w-7xl flex-col">
          <Logo />

          <div className="mb-[10px] mt-5 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <a className="text-sm font-medium text-gray220" href="#">
                Biz haqimizda
              </a>
              <a className="text-sm font-medium text-gray220" href="#">
                Filiallar
              </a>
            </div>

            <a
              href="tel:+998999999999"
              className="text-sm font-medium text-gray220"
            >
              +998 99 999 99 99
            </a>
          </div>

          <div className="flex items-center justify-between">
            <a className="text-sm font-medium text-gray220" href="#">
              Foydalanish shartlari
            </a>

            <h6 className="text-sm font-medium text-gray220">
              <a href="" className="text-blue30 underline mr-1 no-underline">
                RoboSell
              </a>
              tomonidan taqdim etilgan
            </h6>

            <div className="flex items-center gap-4">
              <a className="text-sm font-medium text-gray220" href="#">
                Telegram
              </a>
              <a className="text-sm font-medium text-gray220" href="#">
                Instagram
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Footer;
