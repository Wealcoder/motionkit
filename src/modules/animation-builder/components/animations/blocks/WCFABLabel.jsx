import ToolTipWrapper from "@/components/common/ToolTipWrapper";
import { trimString } from "@/utils/utils";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const labelVariant = cva(
  "text-foreground font-inter font-semibold leading-5 tracking-normal text-nowrap",
  {
    variants: {
      size: {
        sm: "text-xs",
        md: "text-xs",
        lg: "text-xs",
      },
    },
    defaultVariants: {
      size: "sm",
    },
  },
);

const WCFABLabel = ({ size = "sm", title = "", tooltipContent = "" }) => {
  return (
    <div>
      <div className="flex items-center gap-[6px]">
        <span className={cn(labelVariant({ size }))}>
          {trimString(title, 15)}
        </span>
        {tooltipContent && <ToolTipWrapper text={tooltipContent} />}
      </div>
    </div>
  );
};

export default WCFABLabel;
