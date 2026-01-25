import Logo from "@/components/common/Logo";

const Brand = () => {
  return (
    <div
      onClick={() => window.location.reload()}
      className="flex justify-start items-center gap-2"
    >
      <Logo />
      <span className="font-semibold text-base text-white text-nowrap leading-none tracking-normal">
        Animation Builder
      </span>
    </div>
  );
};
export default Brand;
