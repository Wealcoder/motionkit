import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Tick02Icon } from "@hugeicons/core-free-icons/index";
import { HugeiconsIcon } from "@hugeicons/react";
import { cn } from "@/lib/utils";

const Checkbox = React.forwardRef(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      "grid place-content-center peer h-4 w-4 shrink-0 rounded-sm border-1 border-solid border-foreground-secondary data-[state=checked]:border-button-action shadow focus-visible:outline-none focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50 bg-transparent data-[state=checked]:!bg-button-action data-[state=checked]:text-foreground",
      className,
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className={cn("grid place-content-center text-current")}
    >
      <HugeiconsIcon
        icon={Tick02Icon}
        size={12}
        color="currentColor"
        strokeWidth={2}
      />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
