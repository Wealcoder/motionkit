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
import { ScrollArea } from "@/components/ui/scroll-area";

import AnimationPropsMapping from "@/editor/Shared/controller/animation_handler/AnimationPropsMapping";

import { HugeiconsIcon } from "@hugeicons/react";
import { Search01Icon, AddCircleIcon } from "@hugeicons/core-free-icons";

import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { toCamelCase } from "@/utils/utils";

const selectTriggerVariants = cva(
  "flex justify-center items-center gap-2 !bg-select text-foreground !text-xss font-medium leading-18 tracking-normal border-none outline-none !rounded-5 cursor-pointer",
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

const WCFABAddAnimationElement = ({
  property = {},
  onValueChange = () => {},
}) => {
  const {
    size = "custom",
    icon = <HugeiconsIcon icon={AddCircleIcon} size={16} strokeWidth={2} />,
    fieldData = [],
    isSearchEnabled = true,
  } = property;

  const [configuration, setConfiguration] = useState({});
  const [pageTransitionFields, setPageTransitionField] = useState([]);
  const [search, setSearch] = useState("");

  if (!fieldData?.length) {
    console.warn("Field data required!");
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

  // selecting a field and update field rendering and configuration
  const handleSelect = (currentField = {}) => {
    const { key = null, path = null } = currentField || {};
    if (!key || !path) return;
    const isExists = pageTransitionFields?.some((field) => field?.key == key);
    if (isExists) return;
    setPageTransitionField([currentField, ...pageTransitionFields]);
    setConfiguration((prev) => {
      const next = { ...prev };
      next[path] = "";
      return next;
    });
  };

  // mapping page transition fields
  const fields = useMemo(() => {
    return pageTransitionFields
      ?.map((property, index) => {
        const { path = "", fieldType = null } = property || {};

        // removing tooltip and modifying size for dynamic properties
        property.tooltipContent = null;
        property.size = "lg";

        if (!path || !fieldType) return null;
        return (
          <AnimationPropsMapping
            key={`${path}${index}`}
            property={property}
            defaultData={configuration}
            contentStep={configuration}
            updateContentData={(value) => {
              setConfiguration(value?.data);
              onValueChange(value?.data);
            }}
          />
        );
      })
      .filter(Boolean);
  }, [pageTransitionFields]);

  return (
    <div>
      <ScrollArea className="mb-2">
        {/* all fields */}
        <div className="max-h-[160px] space-y-2 overflow-y-auto overflow-x-hidden">
          {fields?.map((item) => item)}
        </div>
      </ScrollArea>
      {/* choosing fields */}
      <Select onValueChange={handleSelect}>
        <SelectTrigger
          disabled={!fieldData?.length}
          enableRightIcon={false}
          className={cn(selectTriggerVariants({ size }))}
        >
          {icon}
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
            {normalizedGroups?.map((group, groupIndex) => {
              const filtered = filterOptions(group.options);
              if (!filtered.length) return null;

              return (
                <SelectGroup key={groupIndex} className="p-[3px]">
                  {group?.groupName && (
                    <SelectLabel className="px-2 py-1 text-[12px] font-bold text-muted-foreground border-b border-b-[var(--background-secondary)] select-none">
                      {group?.groupName ?? ""}
                    </SelectLabel>
                  )}

                  {filtered?.map((field, index) => {
                    const isObject =
                      !Array.isArray(field) && typeof field === "object";
                    const value = isObject ? field.value : toCamelCase(field);
                    const title = isObject ? field.title : field;

                    return (
                      <SelectItem
                        key={`${groupIndex}-${index}`}
                        value={field}
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
    </div>
  );
};

export default WCFABAddAnimationElement;
