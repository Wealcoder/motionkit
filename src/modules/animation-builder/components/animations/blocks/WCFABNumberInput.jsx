import { useCallback, useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { debounceFn } from "@/utils/utils";
import { cn } from "@/lib/utils";
import { inputVariants } from "@/components/animations/blocks/shared/style";

const clamp = (num, min, max) => {
  if (min !== undefined && num < min) return min;
  if (max !== undefined && num > max) return max;
  return num;
};

const normalizeNumber = (value) => {
  if (value === "" || value === null || value === undefined) return null;
  const num = Number(value);
  return Number.isNaN(num) ? null : num;
};

const WCFABNumberInput = ({
  size = "sm",
  placeholder = "Add Value",
  value,
  onValueChange = () => {},
  min,
  max,
  step,
  ...rest
}) => {
  const [currentValue, setCurrentValue] = useState(value ?? "");

  // Debounced callback for parent
  const onDebounceChange = useCallback(
    debounceFn((raw) => {
      const num = normalizeNumber(raw);
      if (num === null) {
        onValueChange(null);
        return;
      }
      onValueChange(clamp(num, min, max));
    }, 150),
    [min, max, onValueChange],
  );

  const handleInputChange = (e) => {
    let val = e.target.value;

    // Allow empty & valid numeric typing
    if (val === "" || /^[0-9]*\.?[0-9]*$/.test(val)) {
      // Clamp immediately for display
      const num = normalizeNumber(val);
      setCurrentValue(num === null ? "" : clamp(num, min, max));
      onDebounceChange(val);
    }
  };

  // Sync external value → input
  useEffect(() => {
    if (value === null || value === undefined) {
      setCurrentValue("");
    } else {
      setCurrentValue(String(clamp(value, min, max)));
    }
  }, [value, min, max]);

  // Cleanup debounce
  useEffect(() => {
    return () => onDebounceChange?.cancel?.();
  }, [onDebounceChange]);

  return (
    <Input
      type="number"
      value={currentValue}
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
