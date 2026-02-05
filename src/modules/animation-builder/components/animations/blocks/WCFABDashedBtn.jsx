import React from "react";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { DashedLine02Icon } from "@hugeicons/core-free-icons/index";

const dashedBtnVariants = cva("wcf-ab-button-icon", {
  variants: {
    size: {
      sm: "h-2 w-2",
      md: "h-2 w-2",
      lg: "h-5 w-5",
    },
  },
  defaultVariants: {
    size: "sm",
  },
});

const WCFABDashedBtn = React.forwardRef(
  ({ size = "sm", className, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        className={cn(dashedBtnVariants({ size }), className)}
        {...props}
      >
        <HugeiconsIcon icon={DashedLine02Icon} size={11} strokeWidth={1.2} />
      </Button>
    );
  },
);

WCFABDashedBtn.displayName = "WCFABDashedBtn";

export default WCFABDashedBtn;
