import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-[34px] w-full px-[10px] py-2 bg-input hover:bg-input-hover focus:bg-input-focus text-input-placeholder hover:text-input-text-hover focus:text-input-text-focus text-xs transition-colors rounded-5 border-none outline-none cursor-text placeholder:text-input-placeholder disabled:cursor-not-allowed disabled:opacity-50 ",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";

export { Input };
