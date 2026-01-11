import { useState } from "react";
import { Input } from "@/components/ui/input";
import { debounceFn } from "@/utils/utils";
import ToolTipWrapper from "../common/ToolTipWrapper";
import DeleteBtn from "./shared/DeleteBtn";

const NumberField = ({
  label = "Label",
  tooltipContent = "Enter the value.",
  value = 0,
  config = {
    min: 0,
    max: 0,
  },
  isRequired = false,
  isCustomAnim = true,
  onDelete = () => {},
  onDisabledUpdate = () => {},
  onUpdateValue = () => {},
}) => {
  const [inputValue, setInputValue] = useState(value ?? 0);
  const [isDataValid, setIsDataValid] = useState(false);

  const handleInput = debounceFn((newValue) => {
    if (newValue === "" || newValue === "-") return;
    let currentValue = Number(newValue);
    if (isNaN(currentValue)) return;
    if (config?.min !== 0 || config?.max !== 0) {
      if (currentValue < config.min) currentValue = config.min;
      if (currentValue > config.max) currentValue = config.max;
      setInputValue(currentValue);
      onUpdateValue(currentValue);
      return;
    }
    setInputValue(currentValue);
    onUpdateValue(currentValue);
  }, 150);

  return (
    <div className="p-2">
      <div className="flex flex-col justify-between gap-3 w-97.5 h-8.5 mx-auto rounded-lg sm:flex-row sm:items-center">
        {/* left label + tooltip */}
        <div className="flex items-center gap-3 text-[#E4E4E7]">
          <h2 className="text-white text-sm w-16.5 h-4.5">{label}</h2>
          {tooltipContent && <ToolTipWrapper text={tooltipContent} />}
        </div>

        {/* right add + delete button */}
        <div className="flex items-center gap-2 w-34.5 h-8.5">
          <Input
            placeholder="Add Value"
            className="flex items-center justify-center w-28.5"
            value={inputValue}
            min={config?.min === 0 ? Infinity : config?.min}
            max={config?.max === 0 ? Infinity : config?.max}
            type="number"
            onChange={(e) => {
              const value = e.target.value;
              setInputValue(value);
              handleInput(value);
            }}
          />
          <div>{isCustomAnim && <DeleteBtn onDelete={onDelete} />}</div>
        </div>
      </div>

      {/* required message */}
      <div>
        <p className="text-white text-sm">
          {isRequired && "Field is Required"}
        </p>
      </div>
    </div>
  );
};

export default NumberField;
