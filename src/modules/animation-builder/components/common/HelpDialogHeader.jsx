import { DialogClose } from "@/components/ui/dialog";
import { HugeiconsIcon } from "@hugeicons/react";
import { CancelCircleIcon } from "@hugeicons/core-free-icons";
import Logo from "@/components/common/Logo";

const HelpDialogHeader = ({ title = "Title" }) => {
  return (
    <div>
      <div className="flex items-center justify-between px-[15px] py-[14px]">
        {/* Left side */}
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-6 h-6 [&_img]:max-w-[18px] [&_img]:h-[18px]">
            <Logo />
          </div>

          <h2 className="text-[13px] font-semibold text-[#E4E4E7] leading-5 tracking-normal m-0">
            {title}
          </h2>
        </div>

        {/* Right side close button */}
        <DialogClose asChild>
          <button className="flex items-center justify-center bg-transparent border-none cursor-pointer">
            <HugeiconsIcon
              icon={CancelCircleIcon}
              size={16}
              strokeWidth={1.2}
              className="text-[#A1A1AA]"
            />
          </button>
        </DialogClose>
      </div>
      <div className="w-full h-[1px] bg-[#303033]"></div>
    </div>
  );
};

export default HelpDialogHeader;
