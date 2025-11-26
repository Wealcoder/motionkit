import * as React from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";

import { cn } from "@/lib/utils";

const Accordion2 = AccordionPrimitive.Root;

const AccordionItem2 = React.forwardRef(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item ref={ref} className={cn(className)} {...props} />
));
AccordionItem2.displayName = "AccordionItem2";

const AccordionTrigger2 = React.forwardRef(
  ({ className, children, ...props }, ref) => (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        ref={ref}
        className={cn(
          "flex flex-1 items-center justify-between text-xs bg-transparent text-text p-2 pe-0 transition-all text-left [&>svg]:-rotate-90 [&[data-state=open]>svg]:rotate-0 cursor-pointer",
          className
        )}
        {...props}
      >
        {children}
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
);
AccordionTrigger2.displayName = AccordionPrimitive.Trigger.displayName;

const AccordionContent2 = React.forwardRef(
  ({ className, children, ...props }, ref) => (
    <AccordionPrimitive.Content
      ref={ref}
      className="overflow-hidden text-sm data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
      {...props}
    >
      <div className={cn("pb-4 pt-0", className)}>{children}</div>
    </AccordionPrimitive.Content>
  )
);
AccordionContent2.displayName = AccordionPrimitive.Content.displayName;

export { Accordion2, AccordionItem2, AccordionTrigger2, AccordionContent2 };
