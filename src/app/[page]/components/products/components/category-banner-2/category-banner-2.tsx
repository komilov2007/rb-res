import { CATEGORY_BANNER_IMAGE } from "../../constants";

type CategoryBanner2Props = {
  title: string;
  imageSrc?: string;
  videoSrc?: string;
};

const CategoryBanner2 = ({ title, imageSrc, videoSrc }: CategoryBanner2Props) => {
  const bannerImage = imageSrc ?? CATEGORY_BANNER_IMAGE;

  return (
    <div className=" lg:flex lg:flex-col">
      <div className="surface-banner-shadow relative -mx-4 w-screen overflow-hidden rounded-[28px] bg-white pb-0 ring-1 ring-black/5 lg:mb-5 lg:mx-0 lg:w-full lg:rounded-[24px]">
        <div className="block max-h-[300px] w-full overflow-hidden bg-gray20 lg:h-auto lg:aspect-[1280/400]">
          {videoSrc ? (
            <video
              className="h-full w-full border border-b-white object-cover"
              src={videoSrc}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
            />
          ) : (
            <img
              className="h-full w-full border border-b-white object-cover"
              src={bannerImage}
              alt={title}
              loading="lazy"
            />
          )}
        </div>
      </div>
      <h2 className="title50 mb-4 text-black lg:text-2xl">{title}</h2>
    </div>
  );
};

export default CategoryBanner2;

