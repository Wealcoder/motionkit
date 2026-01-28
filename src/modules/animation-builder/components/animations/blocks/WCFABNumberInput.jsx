import { useCallback, useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { debounceFn } from "@/utils/utils";
import { cn } from "@/lib/utils";
import { inputVariants } from "@/components/animations/blocks/shared/style";

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

const WCFABNumberInput = ({
  property = {},
  value = null,
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

  // IMPORTANT: keep raw input string for typing UX
  const [inputValue, setInputValue] = useState(
    value === null || value === undefined ? "" : String(value),
  );

  const onDebounceChange = useCallback(
    debounceFn((raw) => {
      const num = parseNumber(raw);

      if (num === null) {
        onValueChange(null);
        return;
      }

      onValueChange(clamp(num, min, max));
    }, 150),
    [min, max, onValueChange],
  );

  const handleInputChange = (e) => {
    const val = e.target.value;
    if (/^-?\d*\.?\d*$/.test(val)) {
      setInputValue(val);
      onDebounceChange(val);
    }
  };

  // Sync external value → input
  useEffect(() => {
    if (value === null || value === undefined) {
      setInputValue("");
    } else {
      setInputValue(String(clamp(value, min, max)));
    }
  }, [value, min, max]);

  useEffect(() => {
    return () => onDebounceChange?.cancel?.();
  }, [onDebounceChange]);

  return (
    <Input
      type="number"
      value={inputValue}
      placeholder={placeholder}
      min={min}
      max={max}
      step={step}
      onChange={handleInputChange}
      className={cn(inputVariants({ size }))}
      {...rest}
    />
  );
};

export default WCFABNumberInput;
