import { useCallback, useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { debounceFn } from "@/utils/utils";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const inputVariants = cva(
  "bg-input hover:bg-input-hover focus:bg-input-focus text-foreground-secondary hover:text-foreground focus:text-foreground !text-xss font-inter font-normal leading-4.25 tracking-normal placeholder:text-xss border-none rounded-5 outline-none ring-0 focus-visible:ring-0 transition-colors cursor-text",
  {
    variants: {
      size: {
        sm: "h-7 px-[10px] min-w-[100px] max-w-[100px]",
        md: "h-7 px-2.5 min-w-[150px] max-w-[150px]",
        lg: "h-7 px-3 w-full",
      },
    },
    defaultVariants: {
      sm: "sm",
    },
  },
);

const WCFABInput = ({
  size = "sm",
  type = "text",
  placeholder = "Add Value",
  value = "",
  onValueChange = () => {},
  min,
  max,
  step,
  ...rest
}) => {
  const isNumberType = type === "number";

  // Fix: initialize properly based on type
  const [currentValue, setCurrentValue] = useState(
    isNumberType
      ? value !== undefined && value !== null
        ? String(value)
        : ""
      : value,
  );

  const handleOnChange = useCallback(
    debounceFn((val) => {
      if (isNumberType) {
        const num = val === "" ? "" : Number(val);
        // Enforce min/max when calling the callback
        if (num !== "") {
          if (min !== undefined && num < min) {
            onValueChange(min);
            return;
          }
          if (max !== undefined && num > max) {
            onValueChange(max);
            return;
          }
        }
        onValueChange(num);
      } else {
        onValueChange(val);
      }
    }, 150),
    [onValueChange, isNumberType, min, max],
  );

  useEffect(() => {
    return () => {
      handleOnChange?.cancel?.();
    };
  }, [handleOnChange]);

  const handleInputChange = (e) => {
    let val = e.target.value;

    if (isNumberType) {
      // Allow empty string to clear input
      if (val === "" || /^[0-9]*\.?[0-9]*$/.test(val)) {
        let numericVal = val === "" ? "" : Number(val);

        // Enforce min/max immediately in input
        if (numericVal !== "") {
          if (min !== undefined && numericVal < min) numericVal = min;
          if (max !== undefined && numericVal > max) numericVal = max;
          val = String(numericVal);
        }

        setCurrentValue(val);
        handleOnChange(val);
      }
    } else {
      setCurrentValue(val);
      handleOnChange(val);
    }
  };

  return (
    <Input
      onChange={handleInputChange}
      type={type}
      className={cn(inputVariants({ size }))}
      value={currentValue}
      placeholder={placeholder || "Add Value"}
      min={isNumberType ? min : undefined}
      max={isNumberType ? max : undefined}
      step={isNumberType ? step : undefined}
      {...rest}
    />
  );
};

export default WCFABInput;
