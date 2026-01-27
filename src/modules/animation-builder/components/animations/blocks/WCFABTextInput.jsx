import { useCallback, useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { debounceFn } from "@/utils/utils";
import { inputVariants } from "@/components/animations/blocks/shared/style";

const WCFABTextInput = ({
  property = {},
  value = "",
  onValueChange = () => {},
}) => {
  const { size = "sm", placeholder = "Add Value", ...rest } = property;
  const [currentValue, setCurrentValue] = useState(value || "");

  const handleInputChange = (e) => {
    const val = e.target.value;
    setCurrentValue(val);
    handleOnChange(val);
  };

  const handleOnChange = useCallback(
    debounceFn((val) => onValueChange(val), 150),
    [onValueChange],
  );

  useEffect(() => {
    return () => handleOnChange?.cancel?.();
  }, [handleOnChange]);

  return (
    <Input
      type="text"
      value={currentValue}
      placeholder={placeholder}
      onChange={handleInputChange}
      className={cn(inputVariants({ size }))}
      {...rest}
    />
  );
};

export default WCFABTextInput;
