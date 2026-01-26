import React, { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toCamelCase } from "@/utils/utils";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const selectTriggerVariants = cva(
  "!bg-select text-foreground !text-xss font-medium leading-18 border-none outline-none rounded-5 cursor-pointer",
  {
    variants: {
      size: {
        custom: "h-7 px-[10px] min-w-[120px] max-w-[120px]",
        sm: "h-7 px-[10px] min-w-[100px] max-w-[100px]",
        md: "h-7 px-2.5 min-w-[150px] max-w-[150px]",
        lg: "h-7 px-3 w-full",
      },
    },
    defaultVariants: {
      size: "custom",
    },
  },
);

const selectContentVariants = cva(
  "h-[120px] !bg-select-secondary text-foreground !text-xss font-normal leading-5 tracking-normal border-none outline-none rounded-5",
  {
    variants: {
      size: {
        custom: "p-[3px] min-w-[120px] max-w-[120px]",
        sm: "p-[3px] min-w-[100px] max-w-[100px]",
        md: "p-1 min-w-[150px] max-w-[150px]",
        lg: "p-[10px] w-full",
      },
    },
    defaultVariants: {
      size: "custom",
    },
  },
);

const selectItemVariants = cva(
  "!bg-transparent hover:!bg-select-hover data-[state=checked]:!bg-select-hover border-none outline-none focus-within:ring-0 cursor-pointer",
  {
    variants: {
      size: {
        custom: "text-xss font-normal leading-4.25 tracking-tighter",
        sm: "text-xss font-normal leading-4.25 tracking-tighter",
        md: "text-xss font-normal leading-4.25 tracking-tighter",
        lg: "text-xss font-normal leading-4.25 tracking-tighter",
      },
    },
    defaultVariants: {
      size: "custom",
    },
  },
);

const WCFABSelect = ({
  property = {},
  value = "",
  onValueChange = () => {},
}) => {
  const { size = "custom", fieldData = [], ...rest } = property || {};
  const [selectedValue, setSelectedValue] = useState(value ?? "");

  const handleSelect = (value) => {
    setSelectedValue(value);
    onValueChange(value);
  };

  if (!fieldData?.length) {
    console.error("Field data required!");
    return null;
  }

  return (
    <Select open={true} value={selectedValue} onValueChange={handleSelect}>
      <SelectTrigger
        aria-expanded="true"
        data-state="open"
        className={cn(selectTriggerVariants({ size }))}
      >
        <SelectValue placeholder="Select Method" />
      </SelectTrigger>
      <SelectContent className={cn(selectContentVariants({ size }))}>
        {fieldData?.map((field, index) => {
          // if field does not contain value use title (formatting camel case) as value
          const isObjectType =
            !Array.isArray(field) && typeof field === "object";
          const currentValue = isObjectType ? field?.value : toCamelCase(field);
          const title = isObjectType ? field?.title : field;
          return (
            // TODO: fix select trigger and select content
            <SelectItem
              key={index}
              value={currentValue ?? undefined}
              className={cn(selectItemVariants({ size }))}
            >
              {title ?? ""}
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
};
export default WCFABSelect;
