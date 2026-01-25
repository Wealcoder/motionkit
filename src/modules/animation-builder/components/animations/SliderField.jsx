import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { debounceFn, trimString } from "@/utils/utils";
import ToolTipWrapper from "@/components/common/ToolTipWrapper";
import DeleteBtn from "@/components/animations/shared/DeleteBtn";

const SliderField = ({
  property = {},
  value = 0,
  onValueChange = () => {},
  onDisabledUpdate = () => {},
  onDelete = () => {},
}) => {
  const {
    title = "Scale",
    tooltipContent = "Adjust scale value",
    isRequired = false,
    isCustomAnim = false,
    min = 0,
    max = 0,
    step = 1,
    ...rest
  } = property || {};

  const [inputValue, setInputValue] = useState(value ?? 0);
  const [isDataValid, setIsDataValid] = useState(false);

  // input handler
  const handleInput = debounceFn((rewValue) => {
    if (rewValue === "" || rewValue === "-") return;

    let currentValue = Number(rewValue);
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
      <div className="flex flex-col gap-3 rounded-lg  sm:flex-row sm:items-center">
        {/* left title + tooltip */}
        <div className="flex items-center gap-[6px]">
          <span className="wcf-ab-title">{trimString(title, 15)}</span>
          {tooltipContent && <ToolTipWrapper text={tooltipContent} />}
        </div>

        {/* right add + delete button */}
        <div className="flex-1 flex justify-end items-center gap-3">
          <Slider
            defaultValue={[75]}
            max={100}
            step={1}
            className="mx-auto w-full max-w-xs"
          />
          {/* <Slider
            value={[inputValue]}
            min={min === 0 ? Infinity : min}
            max={max === 0 ? Infinity : max}
            step={step}
            onValueChange={(v) => setInputValue(v[0])}
            className="flex-1"
          /> */}
          <Input
            placeholder="Add Value"
            className="wcf-ab-text-input"
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

export default SliderField;
