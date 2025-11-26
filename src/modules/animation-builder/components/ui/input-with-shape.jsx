import * as React from "react";

import { cn } from "@/lib/utils";
import { IconPlaceholderS } from "@/lib/icons";

const InputWithShape = React.forwardRef(
  ({ className, type = "number", ...props }, ref) => {
    return (
      <div className="flex justify-between items-center gap-1.5 h-[26px] w-full rounded border border-border-2 bg-input ps-1.5 pe-[5px] py-[5px] text-xs transition-colors">
        <input
          type={type}
          className={cn(
            "w-full bg-transparent text-text-2 border-0 h-full p-0 file:text-text-2 focus:text-text-2 placeholder:text-placeholder focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 no-spinner",
            className
          )}
          ref={ref}
          {...props}
        />
        <IconPlaceholderS size="13" />
      </div>
    );
  }
);
InputWithShape.displayName = "Input";

export { InputWithShape };
