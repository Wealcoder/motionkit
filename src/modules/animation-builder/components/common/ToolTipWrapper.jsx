import {
  Tooltip,
  ToolTipArrow,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { IconHelp } from "@/lib/icons";

const ToolTipWrapper = ({ text }) => {
  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip delayDuration={100}>
        <TooltipTrigger asChild>
          <div className="cursor-pointer flex justify-center items-center">
            <IconHelp
              className={"fill-placeholder hover:fill-text-2"}
              size="12"
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
