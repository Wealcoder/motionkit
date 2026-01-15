import { useState } from "react";
import { Input } from "@/components/ui/input";
import { debounceFn } from "@/utils/utils";
import ToolTipWrapper from "@/components/common/ToolTipWrapper";
import DeleteBtn from "@/components/animations/shared/DeleteBtn";

const NumberField = ({
  property = {},
  value = 0,
  onDelete = () => {},
  onDisabledUpdate = () => {},
  onUpdateValue = () => {},
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
      console.log({ newValue, currentValue, property });
      if (currentValue < min) currentValue = min;
      if (currentValue > max) currentValue = max;
      setInputValue(currentValue);
      onUpdateValue(currentValue);
      return;
    }
    setInputValue(currentValue);
    onUpdateValue(currentValue);
  }, 150);

  return (
    <div>
      <div className="flex flex-col justify-between gap-3 w-97.5 h-8.5 mx-auto rounded-lg sm:flex-row sm:items-center">
        {/* left title + tooltip */}
        <div className="flex items-center gap-3 text-[#E4E4E7]">
          <span className="text-white text-15 font-normal leading-5 tracking-normal">
            {title}
          </span>
          {tooltipContent && <ToolTipWrapper text={tooltipContent} />}
        </div>

        {/* right add + delete button */}
        <div className="flex-1 flex justify-end items-center gap-3">
          <Input
            placeholder="Add Value"
            className="h-[34px] max-w-52 px-3 py-2 bg-background-input hover:bg-input-hover focus:bg-input-focus text-input-placeholder placeholder:text-input-placeholder hover:text-input-text-hover focus:text-input-text-focus text-sm font-medium leading-[18px] border-none outline-none ring-0 focus:ring-0 rounded-5 cursor-text"
            value={inputValue}
            min={min === 0 ? Infinity : min}
            max={max === 0 ? Infinity : max}
            type="number"
            onChange={(e) => {
              const value = e.target.value;
              setInputValue(value);
              handleInput(value);
            }}
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
