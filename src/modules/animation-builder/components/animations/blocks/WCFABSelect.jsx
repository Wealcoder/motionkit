import React, { useMemo, useState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/selectDC";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { toCamelCase } from "@/utils/utils";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { HugeiconsIcon } from "@hugeicons/react";
import { Search01Icon } from "@hugeicons/core-free-icons";

const selectTriggerVariants = cva(
  " !bg-select text-foreground !text-xss font-medium leading-18 border-none outline-none !rounded-5 cursor-pointer",
  {
    variants: {
      size: {
        custom: "h-7 px-[10px] w-[120px] max-w-[120px]",
        sm: "h-7 px-[10px] w-[100px] max-w-[100px]",
        md: "h-7 px-2.5 w-[150px] max-w-[150px]",
        lg: "h-7 px-3 w-full",
      },
    },
    defaultVariants: {
      size: "custom",
    },
  },
);

const selectContentVariants = cva(
  "z-50 min-w-0 bg-select-secondary text-foreground rounded-5 border-none shadow-md overflow-hidden w-[--radix-select-trigger-width] max-w-full",
  {
    variants: {
      size: {
        custom: "p-[3px] max-h-[140px]",
        sm: "p-[3px] max-h-[140px]",
        md: "p-[3px] max-h-[200px]",
        lg: "p-[10px] max-h-[260px]",
      },
    },
    defaultVariants: {
      size: "custom",
    },
  },
);

const selectItemVariants = cva(
  "relative flex items-center w-full rounded-5 px-2 py-[2px] cursor-pointer outline-none transition-colors hover:bg-select-hover data-[highlighted]:bg-select-hover data-[state=checked]:bg-select-hover text-xss",
);

const WCFABSelect = ({
  property = {},
  value = "",
  onValueChange = () => {},
}) => {
  const { size = "custom", fieldData = [], isSearchEnabled = false } = property;

  const [selectedValue, setSelectedValue] = useState(value ?? "");
  const [search, setSearch] = useState("");

  const handleSelect = (val) => {
    setSelectedValue(val);
    onValueChange(val);
  };

  if (!fieldData?.length) {
    console.error("Field data required!");
    return null;
  }

  // Normalize flat or grouped data
  const normalizedGroups = useMemo(() => {
    // Flat list → single group
    if (!fieldData[0]?.options) {
      return [
        {
          groupName: null,
          options: fieldData,
        },
      ];
    }

    return fieldData;
  }, [fieldData]);

  // Search filter
  const filterOptions = (options) =>
    options?.filter((item) => {
      const title = typeof item === "object" ? item?.title : String(item);
      return title.toLowerCase().includes(search.toLowerCase());
    });

  return (
    <Select value={selectedValue} onValueChange={handleSelect}>
      <SelectTrigger className={cn(selectTriggerVariants({ size }))}>
        <SelectValue placeholder="Select Method" />
      </SelectTrigger>

      <SelectContent className={cn(selectContentVariants({ size }))}>
        {isSearchEnabled && (
          <div className="sticky top-0 z-10 p-1 bg-select-secondary">
            <InputGroup className="bg-input-secondary px-[7px] py-[5px] max-h-7 border-none outline-none rounded-5 focus-within:ring-0">
              <InputGroupInput
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="text-foreground-secondary hover:text-foreground focus:text-foreground active:text-foreground !text-xss font-normal leading-4.25 tracking-normal placeholder:!text-xss"
              />
              <InputGroupAddon className="pl-0">
                <HugeiconsIcon icon={Search01Icon} />
              </InputGroupAddon>
            </InputGroup>
          </div>
        )}
        <div className="overflow-auto scrollbar-none max-h-[calc(var(--radix-select-content-available-height)-40px)]">
          {normalizedGroups.map((group, groupIndex) => {
            const filtered = filterOptions(group.options);
            if (!filtered.length) return null;

            return (
              <SelectGroup key={groupIndex} className="p-[3px]">
                {group?.groupName && (
                  <SelectLabel className="px-2 py-1 text-[12px] font-bold text-muted-foreground border-b border-b-[var(--background-secondary)] select-none">
                    {group?.groupName ?? ""}
                  </SelectLabel>
                )}

                {filtered.map((field, index) => {
                  const isObject =
                    !Array.isArray(field) && typeof field === "object";
                  const value = isObject ? field.value : toCamelCase(field);
                  const title = isObject ? field.title : field;

                  return (
                    <SelectItem
                      key={`${groupIndex}-${index}`}
                      value={value}
                      className={cn(selectItemVariants())}
                    >
                      {title}
                    </SelectItem>
                  );
                })}
              </SelectGroup>
            );
          })}
        </div>
      </SelectContent>
    </Select>
  );
};

export default WCFABSelect;
