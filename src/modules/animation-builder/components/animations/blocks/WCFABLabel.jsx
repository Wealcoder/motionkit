import ToolTipWrapper from "@/components/common/ToolTipWrapper";
import { trimString } from "@/utils/utils";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const labelVariant = cva("font-inter tracking-normal text-nowrap", {
  variants: {
    size: {
      sm: "text-xss !text-tertiary font-normal leading-4.25",
      md: "text-xss !text-tertiary font-medium leading-4.25",
      lg: "text-xs !text-foreground font-medium leading-5",
    },
  },
  defaultVariants: {
    size: "sm",
  },
});

const WCFABLabel = ({ size = "sm", title = "", tooltipContent = null }) => {
  return (
    <div className="flex items-center gap-[6px] min-w-0">
      <span className={cn(labelVariant({ size }))}>
        {trimString(title, 15)}
      </span>
      {tooltipContent && <ToolTipWrapper text={tooltipContent} />}
    </div>
  );
};

export default WCFABLabel;
