import { useState } from "react";
import WCFABDeleteBtn from "@/components/animations/blocks/WCFABDeleteBtn";
import WCFABSlider from "@/components/animations/blocks/WCFABSlider";
import WCFABErrorMessage from "@/components/animations/blocks/WCFABErrorMessage";
import WCFABLabel from "@/components/animations/blocks/WCFABLabel";
import WCFABNumberInput from "@/components/animations/blocks/WCFABNumberInput";
import { debounceFn } from "@/utils/utils";

const clamp = (n, min, max) => {
  let value = n;
  if (typeof min === "number" && min !== 0) {
    value = Math.max(min, value);
  }
  if (typeof max === "number" && max !== 0) {
    value = Math.min(max, value);
  }
  return value;
};

const SliderField = ({
  property = {},
  value = 0,
  onValueChange = () => {},
  onDisabledUpdate = () => {},
  onDelete = () => {},
}) => {
  const {
    size = "sm",
    title = "Scale",
    tooltipContent = "Adjust scale value",
    isRequired = false,
    isCustomAnim = false,
    min = 0,
    max = 0,
    ...rest
  } = property || {};

  const [currentValue, setCurrentValue] = useState(value || 0);
  const [isDataValid, setIsDataValid] = useState(false);

  // input handler
  const handleInput = debounceFn((rawValue) => {
    const num = Number(rawValue);
    if (Number.isNaN(num)) return;
    const current = clamp(num, min, max);
    setCurrentValue(current);
    onValueChange(current);
  }, 150);

  return (
    <div>
      <div className="flex w-full items-center gap-2">
        {/* LEFT: flexible */}
        <div className="flex flex-1 items-center gap-2 min-w-0">
          <WCFABLabel
            title={title}
            size={size}
            tooltipContent={tooltipContent}
          />

          {/* Slider must be allowed to shrink */}
          <div className="flex-1 min-w-0">
            <WCFABSlider
              property={property}
              value={currentValue}
              onValueChange={handleInput}
            />
          </div>
        </div>

        {/* RIGHT: fixed, never shrink */}
        <div className="flex items-center gap-2 shrink-0">
          <WCFABNumberInput
            property={property}
            value={currentValue}
            onValueChange={handleInput}
          />
          {isCustomAnim && <WCFABDeleteBtn onDelete={onDelete} />}
        </div>
      </div>

      {/* required message */}
      {isRequired && isDataValid && (
        <WCFABErrorMessage message={"This field is required"} />
      )}
    </div>
  );
};

export default SliderField;
