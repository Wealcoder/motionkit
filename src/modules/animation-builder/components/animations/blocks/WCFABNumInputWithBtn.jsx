import React, { useState, useEffect, useCallback } from "react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { HugeiconsIcon } from "@hugeicons/react";
import { MinusSignIcon, PlusSignIcon } from "@hugeicons/core-free-icons";
import { debounceFn } from "@/utils/utils";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

// Input field variants
const inputGroupVariants = cva(
  "px-[10px] py-[5px] bg-input hover:bg-input-hover focus:bg-input-focus border-none rounded-5 outline-none ring-0 focus-visible:ring-0 transition-colors cursor-text",
  {
    variants: {
      size: {
        sm: "h-7 min-w-[80px] max-w-[150px]",
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

// Button variants
const buttonVariants = cva(
  "!px-[3px] !py-[6px] bg-background-topbar hover:bg-button-hover focus:bg-button-focus active:bg-button-action text-foreground text-button-icon-size border-none outline-none focus-visible:ring-0 rounded-5 cursor-pointer",
  {
    variants: {
      position: {
        left: "rounded-r-none",
        right: "rounded-l-none",
      },
      size: {
        sm: "!w-6  h-[22px]",
        md: "!w-6  h-[22px]",
        lg: "!w-6  h-[22px]",
      },
    },
    defaultVariants: {
      size: "sm",
      position: "left",
    },
  },
);

const WCFABNumInputWithBtn = ({
  size = "sm",
  placeholder = "Add Value",
  value = 0,
  onValueChange = () => {},
  min,
  max,
  step = 1,
  precision = 2,
  ...rest
}) => {
  const [currentValue, setCurrentValue] = useState(value);

  // Clamp a value within min/max
  const clampValue = (val) => {
    let num = Number(val);
    if (Number.isNaN(num)) return "";
    if (min !== undefined && num < min) num = min;
    if (max !== undefined && num > max) num = max;
    return Number(num.toFixed(precision));
  };

  // Commit value to state and callback
  const commitValue = (val) => {
    const clamped = clampValue(val);
    setCurrentValue(clamped);
    onValueChange(clamped);
  };

  // Debounced input change handler
  const handleInput = useCallback(
    debounceFn((val) => commitValue(val), 150),
    [min, max, precision, onValueChange],
  );

  // Handle manual typing
  const handleChange = (e) => {
    const val = e.target.value;
    if (val === "" || /^[0-9]*\.?[0-9]*$/.test(val)) {
      setCurrentValue(val);
      handleInput(val);
    }
  };

  // Handle plus/minus buttons
  const updateValue = (delta) => {
    const newValue = clampValue(Number(currentValue) + delta);
    commitValue(newValue);
  };

  // Sync with external value prop
  useEffect(() => {
    setCurrentValue(clampValue(value));
  }, [value, min, max]);

  return (
    <InputGroup className={cn(inputGroupVariants({ size }))}>
      {/* Number Input */}
      <InputGroupInput
        className={cn(inputVariants({ size }))}
        placeholder={placeholder}
        value={currentValue}
        type="number"
        min={min}
        max={max}
        step={step}
        onChange={handleChange}
        {...rest}
      />

      {/* Minus Button */}
      <InputGroupAddon align="inline-end" className="!mr-0 p-0">
        <InputGroupButton
          className={cn(buttonVariants({ position: "left", size }))}
          onClick={() => updateValue(-step)}
        >
          <HugeiconsIcon
            icon={MinusSignIcon}
            strokeWidth={2}
            className="text-foreground"
          />
        </InputGroupButton>
      </InputGroupAddon>
      <InputGroupAddon
        align="inline-end"
        className="bg-button-hover w-[1px] h-full min-h-[22px] !mr-0 p-0"
      />
      {/* Plus Button */}
      <InputGroupAddon align="inline-end" className={"p-0"}>
        <InputGroupButton
          className={cn(buttonVariants({ position: "right", size }))}
          onClick={() => updateValue(step)}
        >
          <HugeiconsIcon
            icon={PlusSignIcon}
            strokeWidth={2}
            className="text-foreground"
          />
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  );
};

export default WCFABNumInputWithBtn;
