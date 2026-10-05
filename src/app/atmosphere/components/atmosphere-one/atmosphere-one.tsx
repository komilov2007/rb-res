import type { AtmosphereVariantProps } from "../../constants";
import AtmosphereHero from "../atmosphere-hero";
import AtmospherePhotos from "../atmosphere-photos";

const AtmosphereOne = ({ onOpen }: AtmosphereVariantProps) => {
  return (
    <>
      <AtmosphereHero onOpen={() => onOpen(0)} />
      <AtmospherePhotos onOpen={(index) => onOpen(index + 1)} />
    </>
  );
};

export default AtmosphereOne;
