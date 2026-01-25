import { useState } from "react";
import { Input } from "@/components/ui/input";
import { debounceFn, trimString } from "@/utils/utils";
import ToolTipWrapper from "@/components/common/ToolTipWrapper";
import DeleteBtn from "@/components/animations/shared/DeleteBtn";

const NumberField = ({
  property = {},
  value = 0,
  onDelete = () => {},
  onDisabledUpdate = () => {},
  onValueChange = () => {},
}) => {
  // default value
  const {
    title = "title",
    tooltipContent = "Enter the value.",
    isRequired = false,
    isCustomAnim = false,
    min = 0,
    max = 0,
    path = "",
    ...rest
  } = property || {};

  const [inputValue, setInputValue] = useState(value ?? 0);
  const [isDataValid, setIsDataValid] = useState(false);

  const handleInput = debounceFn((newValue) => {
    if (newValue === "" || newValue === "-") return;
    let currentValue = Number(newValue);
    if (isNaN(currentValue)) return;
    if (min !== 0 || max !== 0) {
      if (currentValue < min) currentValue = min;
      if (currentValue > max) currentValue = max;
      setInputValue(currentValue);
      onValueChange(currentValue);
      return;
    }
    setInputValue(currentValue);
    onValueChange(currentValue);
  }, 150);

  return (
    <div>
      <div className="flex flex-col justify-between gap-3 w-97.5 h-8.5 mx-auto rounded-lg sm:flex-row sm:items-center">
        {/* left title + tooltip */}
        <div className="flex items-center gap-[6px]">
          <span className="wcf-ab-title">{trimString(title, 15)}</span>
          {tooltipContent && <ToolTipWrapper text={tooltipContent} />}
        </div>

        {/* right add + delete button */}
        <div className="flex-1 flex justify-end items-center gap-3">
          <Input
            placeholder="Add Value"
            className="wcf-ab-number-input"
            value={inputValue}
            min={min === 0 ? Infinity : min}
            max={max === 0 ? Infinity : max}
            type="number"
            onChange={(e) => handleInput(e.target.value)}
          />
          {isCustomAnim && <DeleteBtn onDelete={onDelete} />}
        </div>
      </div>

      {/* required message */}
      {isRequired && isDataValid && (
        <p className="text-white text-sm">Field is Required</p>
      )}
    </div>
  );
};

export default NumberField;
