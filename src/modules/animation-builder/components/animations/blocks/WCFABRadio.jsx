import React from "react";
import { cva } from "class-variance-authority";
import { RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
const RadioVariants = cva(
  "border-none rounded-full !p-0 bg-button data-[state=checked]:bg-button-action [&_svg]:hidden focus-visible:ring-0 cursor-pointer",
  {
    variants: {
      size: {
        sm: "h-[14px] w-[14px]",
        md: "h-[16px] w-[16px] ",
        lg: "h-[18px] w-[18px]",
      },
    },
    defaultVariants: {
      size: "sm",
    },
  },
);

const WCFABRadio = ({ value, label, size = "sm", id }) => {
  return (
    <div className="flex items-center gap-1.5 max-w-16.5">
      <RadioGroupItem
        value={value}
        id={id}
        className={cn(RadioVariants({ size }))}
      />
      <Label
        htmlFor={id}
        className="text-[#A1A1AA] text-[11.5px] font-normal leading-4.5 p-0"
      >
        {label}
      </Label>
    </div>
  );
};

export default WCFABRadio;
