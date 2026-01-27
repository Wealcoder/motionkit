import * as React from "react";
import * as SelectPrimitiveDC from "@radix-ui/react-select";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowDown01Icon,
  ArrowUp01Icon,
  // CheckmarkCircle02Icon,
} from "@hugeicons/core-free-icons/index";

import { cn } from "@/lib/utils";

const SelectDC = SelectPrimitiveDC.Root;

const SelectGroupDC = SelectPrimitiveDC.Group;

const SelectValueDC = SelectPrimitiveDC.Value;

const SelectTriggerDC = React.forwardRef(
  ({ className, children, ...props }, ref) => (
    <SelectPrimitiveDC.Trigger
      ref={ref}
      className={cn(
        "flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background data-[placeholder]:text-muted-foreground focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
        className,
      )}
      {...props}
    >
      {children}
      <SelectPrimitiveDC.Icon asChild>
        <HugeiconsIcon icon={ArrowDown01Icon} className="h-4 w-4 opacity-50" />
      </SelectPrimitiveDC.Icon>
    </SelectPrimitiveDC.Trigger>
  ),
);
SelectTriggerDC.displayName = SelectPrimitiveDC.Trigger.displayName;

const SelectScrollUpButtonDC = React.forwardRef(
  ({ className, ...props }, ref) => (
    <SelectPrimitiveDC.ScrollUpButton
      ref={ref}
      className={cn(
        "flex cursor-default items-center justify-center py-1",
        className,
      )}
      {...props}
    >
      <HugeiconsIcon icon={ArrowUp01Icon} className="h-4 w-4" />
    </SelectPrimitiveDC.ScrollUpButton>
  ),
);
SelectScrollUpButtonDC.displayName =
  SelectPrimitiveDC.ScrollUpButton.displayName;

const SelectScrollDownButtonDC = React.forwardRef(
  ({ className, ...props }, ref) => (
    <SelectPrimitiveDC.ScrollDownButton
      ref={ref}
      className={cn(
        "flex cursor-default items-center justify-center py-1",
        className,
      )}
      {...props}
    >
      <HugeiconsIcon icon={ArrowDown01Icon} className="h-4 w-4" />
    </SelectPrimitiveDC.ScrollDownButton>
  ),
);
SelectScrollDownButtonDC.displayName =
  SelectPrimitiveDC.ScrollDownButton.displayName;

const SelectContentDC = React.forwardRef(
  (
    {
      isScrollEnabled = false,
      className,
      children,
      position = "popper",
      ...props
    },
    ref,
  ) => (
    <SelectPrimitiveDC.Portal>
      <SelectPrimitiveDC.Content
        ref={ref}
        className={cn(
          "relative z-50 max-h-[--radix-select-content-available-height] min-w-[8rem] overflow-y-auto overflow-x-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-[--radix-select-content-transform-origin]",
          position === "popper" &&
            "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
          className,
        )}
        position={position}
        {...props}
      >
        {isScrollEnabled && <SelectScrollUpButtonDC />}
        <SelectPrimitiveDC.Viewport
          className={cn(
            position === "popper" &&
              "h-[var(--radix-select-trigger-height)] w-full",
          )}
        >
          {children}
        </SelectPrimitiveDC.Viewport>
        {isScrollEnabled && <SelectScrollDownButtonDC />}
      </SelectPrimitiveDC.Content>
    </SelectPrimitiveDC.Portal>
  ),
);
SelectContentDC.displayName = SelectPrimitiveDC.Content.displayName;

const SelectLabelDC = React.forwardRef(({ className, ...props }, ref) => (
  <SelectPrimitiveDC.Label
    ref={ref}
    className={cn("px-2 py-1.5 text-sm font-semibold", className)}
    {...props}
  />
));
SelectLabelDC.displayName = SelectPrimitiveDC.Label.displayName;

const SelectItemDC = React.forwardRef(
  ({ className, children, ...props }, ref) => (
    <SelectPrimitiveDC.Item
      ref={ref}
      className={cn(
        "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className,
      )}
      {...props}
    >
      <SelectPrimitiveDC.ItemText>{children}</SelectPrimitiveDC.ItemText>
    </SelectPrimitiveDC.Item>
  ),
);
SelectItemDC.displayName = SelectPrimitiveDC.Item.displayName;

const SelectSeparatorDC = React.forwardRef(({ className, ...props }, ref) => (
  <SelectPrimitiveDC.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-muted", className)}
    {...props}
  />
));
SelectSeparatorDC.displayName = SelectPrimitiveDC.Separator.displayName;

export {
  SelectDC as Select,
  SelectGroupDC as SelectGroup,
  SelectValueDC as SelectValue,
  SelectTriggerDC as SelectTrigger,
  SelectContentDC as SelectContent,
  SelectLabelDC as SelectLabel,
  SelectItemDC as SelectItem,
  SelectSeparatorDC as SelectSeparator,
  SelectScrollUpButtonDC as SelectScrollUpButton,
  SelectScrollDownButtonDC as SelectScrollDownButton,
};
