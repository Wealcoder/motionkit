import { AssetImage } from "../../../../../assets/AssetImage";

const Brand = () => {
  return (
    <div className="flex justify-start items-center gap-2">
      <div className="flex justify-center items-center overflow-hidden">
        <img
          className="h-6 w-6"
          src={AssetImage.logo}
          alt="Animation Builder"
        />
      </div>
      <span className="font-semibold text-base leading-none tracking-normal">
        Animation Builder
      </span>
    </div>
  );
};
export default Brand;
