import {
  Tooltip,
  ToolTipArrow,
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
              size={16}
              strokeWidth={2}
            />
          </div>
        </TooltipTrigger>
        <TooltipContent align="start">
          {text}
          <ToolTipArrow className="fill-[#474852] -mt-[0.5px] ml-5" />
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default ToolTipWrapper;
