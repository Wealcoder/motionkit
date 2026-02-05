import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HugeiconsIcon } from "@hugeicons/react";
import { InformationCircleFreeIcons } from "@hugeicons/core-free-icons/index";

const ToolTipWrapper = ({ text = "" }) => {
  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip delayDuration={100}>
        <TooltipTrigger asChild>
          <div className="cursor-pointer flex justify-center items-center">
            <HugeiconsIcon
              icon={InformationCircleFreeIcons}
              size={10}
              strokeWidth={2}
              color="currentColor"
            />
          </div>
        </TooltipTrigger>
        <TooltipContent align="start" className="!text-[10px] !text-foreground font-normal !bg-button-hover px-1.5 py-1" >{text}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default ToolTipWrapper;
