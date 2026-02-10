import { useCallback, useEffect, useState } from "react";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/selectDC";

import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { parseCssValue, toCssValue } from "@/utils/cssHelper";
import { debounceFn } from "@/utils/utils";

const units = [
  { title: "%", value: "%" },
  { title: "px", value: "px" },
  { title: "em", value: "em" },
  { title: "ch", value: "ch" },
  { title: "rem", value: "rem" },
  { title: "vh", value: "vh" },
  { title: "vw", value: "vw" },
  { title: "svh", value: "svh" },
  { title: "svw", value: "svw" },
];

const inputGroupVariants = cva(
  "px-[10px] py-[5px] bg-input hover:bg-input-hover focus:bg-input-focus border-none rounded-5 outline-none ring-0 focus-visible:ring-0 transition-colors cursor-text",
  {
    variants: {
      size: {
        sm: "h-7 min-w-[80px] max-w-[100px]",
        md: "h-8 min-w-[120px] max-w-[150px]",
        lg: "h-9 w-full",
      },
    },
    defaultVariants: {
      size: "sm",
    },
  },
);

const inputVariants = cva(
  "p-0 text-foreground-secondary hover:text-foreground focus:text-foreground  font-inter font-normal leading-4.25 tracking-normal placeholder:text-xss",
  {
    variants: {
      size: {
        sm: "!text-xss",
        md: "!text-xss",
        lg: "!text-xss",
      },
    },
    defaultVariants: {
      size: "sm",
    },
  },
);

const buttonVariants = cva(
  "!pl-[6px] !py-[2px] !pr-[2px] [&_svg]:hidden !text-foreground font-inter text-xss font-normal leading-4.25 tracking-normal font border-none outline-none focus-visible:ring-0 rounded-5 cursor-pointer",
  {
    variants: {
      size: {
        sm: "!min-w-6 max-w-[50px] h-[22px]",
        md: "!min-w-6 max-w-[50px] h-[22px]",
        lg: "!min-w-6 max-w-[50px] h-[22px]",
      },
    },
    defaultVariants: {
      size: "sm",
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
  "relative flex justify-center items-center w-full rounded-5 my-[2px] !p-0.5 cursor-pointer outline-none transition-colors hover:bg-select-hover data-[highlighted]:bg-select-hover data-[state=checked]:bg-select-hover text-xss",
);

const clamp = (num, min, max) => {
  if (typeof min === "number" && num < min) return min;
  if (typeof max === "number" && num > max) return max;
  return num;
};

const parseNumber = (value) => {
  if (value === "" || value === "-" || value === null) return null;
  const num = Number(value);
  return Number.isNaN(num) ? null : num;
};

const WCFABCssInput = ({
  property = {},
  value = "",
  unit: controlledUnit,
  onValueChange = () => {},
}) => {
  const {
    size = "sm",
    placeholder = "Add Value",
    min,
    max,
    step,
    ...rest
  } = property;

  const [inputValue, setInputValue] = useState(value ?? "");
const [selectedUnit, setSelectedUnit] = useState(controlledUnit ?? "px");

  // console.log(inputValue);
  // console.log(selectedUnit);

  // sync incoming value
 useEffect(() => {
  // if parent explicitly controls unit (padding case)
  if (controlledUnit) {
    setInputValue(value ?? "");
    setSelectedUnit(controlledUnit);
    return;
  }

  // fallback: normal css parsing (margin, width, etc.)
  const parsedValue = parseCssValue(value, "px");
  setInputValue(parsedValue?.value ?? "");
  setSelectedUnit(parsedValue?.unit ?? "px");
}, [value, controlledUnit]);


  const updateValue = (next = {}) => {
    // console.log("next values", next);

    const nextValue = next.value ?? inputValue ?? 0;
    const nextUnit = next.unit ?? selectedUnit ?? "px";
    const result = toCssValue(nextValue, nextUnit);

    // console.log("final value to send to hoc", result);

    onValueChange(result);
  };

  const onDebounceChange = useCallback(
    debounceFn((raw) => {
      const num = parseNumber(raw);
      if (num === null) {
        onValueChange(null);
        return;
      }
      updateValue({ value: clamp(num, min, max) });
    }, 150),
    [min, max, onValueChange],
  );

  const handleInput = (e) => {
    const val = e.target.value;
    if (/^-?\d*\.?\d*$/.test(val)) {
      setInputValue(val);
      onDebounceChange(val);
    }
  };

  // unit select handler
  const handleSelect = (unit) => {
    // console.log(unit);
    setSelectedUnit(unit);
    updateValue({ unit });
  };

  return (
    <InputGroup className={cn(inputGroupVariants({ size }))}>
      {/* Number Input */}
      <InputGroupInput
        className={cn(inputVariants({ size }))}
        placeholder={placeholder}
        value={inputValue}
        type="text"
        onChange={handleInput}
      />

      {/* Minus Button */}
      <InputGroupAddon align="inline-end" className={"text-foreground p-0"}>
        <Select value={selectedUnit} onValueChange={handleSelect}>
          <SelectTrigger className={cn(buttonVariants({ size }))}>
            <SelectValue placeholder={selectedUnit} />
          </SelectTrigger>
          <SelectContent className={cn(selectContentVariants({ size }))}>
            {units?.map((field, index) => (
              <SelectItem
                key={index}
                value={field.value}
                className={cn(selectItemVariants({ size }))}
              >
                {field.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </InputGroupAddon>
    </InputGroup>
  );
};
export default WCFABCssInput;
