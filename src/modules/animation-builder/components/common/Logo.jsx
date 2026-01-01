import { AssetImage } from "../../../../assets/AssetImage";
const Logo = () => {
  return (
    <div className="flex justify-center items-center cursor-pointer">
      <img
        className="h-6 w-6 pointer-events-none"
        src={AssetImage.logo}
        alt="Animation Builder"
      />
    </div>
  );
};

export default Logo;
