import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-5 text-xs text-white font-medium focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 cursor-pointer transition-all duration-100 ease-out active:scale-x-95 active:scale-y-90 active:translate-y-[1px] active:opacity-90",
  {
    variants: {
      variant: {
        default: "bg-button-primary hover:bg-button-primary-hover",
        secondary: "bg-button-secondary hover:bg-button-secondary-hover",
        tertiary: "bg-button-tertiary hover:bg-button-tertiary-hover",
        play: "bg-play-button hover:bg-play-button-hover",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-6 px-2.5 py-1",
        tertiary: "h-6 px-2 py-1",
        play: "h-[30px] w-full px-2 py-1",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const Button = React.forwardRef(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
