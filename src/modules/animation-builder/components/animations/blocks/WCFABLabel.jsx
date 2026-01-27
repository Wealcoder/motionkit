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
    <div className="flex items-center gap-[6px] min-w-0">
      <span className={cn(labelVariant({ size }), "select-none")}>
        {trimString(title, 15)}
      </span>
      {tooltipContent && <ToolTipWrapper text={tooltipContent} />}
    </div>
  );
};

export default WCFABLabel;
