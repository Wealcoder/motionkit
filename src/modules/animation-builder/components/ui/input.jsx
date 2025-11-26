import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-[26px] w-full rounded border border-border-2 bg-input ps-1.5 pe-2 py-[5px] text-xs transition-colors text-text-2 file:text-text-2 focus:text-text-2 placeholder:text-placeholder focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";

export { Input };
