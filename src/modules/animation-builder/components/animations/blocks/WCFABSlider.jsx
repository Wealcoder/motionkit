import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { debounceFn } from "@/utils/utils";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const sliderVariant = cva(
  "relative flex w-full touch-none select-none items-center min-w-[-webkit-fill-available]",
  {
    variants: {
      size: {
        sm: [
          "[&>span[data-orientation]]:h-[2px]",
          "[&>span[data-orientation]]:rounded-full",
          "[&>span[data-orientation]]:bg-button",

          /* RANGE (flat look) */
          "[&>span[data-orientation]>span]:bg-button",

          /* THUMB */
          "[&_[role=slider]]:h-[8px]",
          "[&_[role=slider]]:w-[8px]",
          "[&_[role=slider]]:rounded-full",
          "[&_[role=slider]]:bg-button-action",
          "[&_[role=slider]]:border-none",
          "[&_[role=slider]]:shadow-none",
          "[&_[role=slider]]:outline-none",
          "[&_[role=slider]]:transition-all",
          "[&_[role=slider]]:duration-150",
          "[&_[role=slider]]:cursor-ew-resize",

          /* HOVER */
          "[&_[role=slider]]:hover:scale-125",

          /* FOCUS */
          "[&_[role=slider]]:focus-visible:outline-none",
          "[&_[role=slider]]:focus-visible:shadow-[0_0_0_4px_rgba(59,130,246,0.35)]",
        ],

        md: [
          "[&>span[data-orientation]]:h-[8px]",
          "[&_[role=slider]]:h-[10px]",
          "[&_[role=slider]]:w-[10px]",
        ],

        lg: [
          "[&>span[data-orientation]]:h-[10px]",
          "[&_[role=slider]]:h-[12px]",
          "[&_[role=slider]]:w-[12px]",
        ],
      },
    },
    defaultVariants: {
      size: "sm",
    },
  },
);

const WCFABSlider = ({
  property = {},
  value = 0,
  onValueChange = () => {},
}) => {
  const { size = "sm", min = -100, max = 100, step = 1 } = property || {};
  const [inputValue, setInputValue] = useState(value || 0);

  const handleInput = (rawValue) => {
    let currentValue = Number(rawValue);
    if (isNaN(currentValue)) return;
    if (currentValue < min) currentValue = min;
    if (currentValue > max) currentValue = max;
    setInputValue(currentValue);
    onValueChange(currentValue);
  };

  return (
    <Slider
      className={cn(sliderVariant({ size }))}
      value={[inputValue]}
      min={min}
      max={max}
      step={step}
      onValueChange={(value) => handleInput(value[0])}
    />
  );
};

export default WCFABSlider;
