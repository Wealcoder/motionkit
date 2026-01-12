import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { debounceFn } from "@/utils/utils";
import ToolTipWrapper from "@/components/common/ToolTipWrapper";
import DeleteBtn from "@/components/animations/shared/DeleteBtn";

const SliderField = ({
  property = {
    title: "Scale",
    tooltipContent: "Adjust scale value",
    isRequired: false,
    isCustomAnim: true,
    min: 0,
    max: 0,
    step: 1,
  },
  value = 0,
  onUpdateValue = () => {},
  onDisabledUpdate = () => {},
  onDelete = () => {},
}) => {
  const [inputValue, setInputValue] = useState(value ?? 0);
  console.log(inputValue);
  const [isDataValid, setIsDataValid] = useState(false);

  // input handler
  const handleInput = debounceFn((rewValue) => {
    if (rewValue === "" || rewValue === "-") return;

    let currentValue = Number(rewValue);
    if (isNaN(currentValue)) return;

    if (property?.min !== 0 || property?.max !== 0) {
      if (currentValue < property?.min) currentValue = property?.min;
      if (currentValue > property?.max) currentValue = property?.max;
      setInputValue(currentValue);
      onUpdateValue(currentValue);
      return;
    }
    setInputValue(currentValue);
    onUpdateValue(currentValue);
  }, 150);

  return (
    <div>
      <div className="flex flex-col gap-3 rounded-lg  sm:flex-row sm:items-center">
        {/* left title + tooltip */}
        <div className="flex items-center gap-3 text-[#E4E4E7]">
          <span className="text-white text-15 font-normal leading-5 tracking-normal">
            {title}
          </span>
          {property?.tooltipContent && <ToolTipWrapper text={tooltipContent} />}
        </div>

        {/* middle slider */}
        <div className="flex-1">
          <Slider
            value={[inputValue]}
            min={property?.min === 0 ? Infinity : property?.min}
            max={property?.max === 0 ? Infinity : property?.max}
            type="number"
            step={property?.step}
            onValueChange={(v) => setInputValue(v[0])}
            className="flex-1"
          />
        </div>

        {/* right add + delete button */}
        <div className="flex-1 flex justify-end items-center gap-3">
          <Input
            placeholder="Add Value"
            className="flex items-center justify-center w-28"
            value={inputValue}
            min={property?.min === 0 ? Infinity : property?.min}
            max={property?.max === 0 ? Infinity : property?.max}
            type="number"
            onChange={(e) => {
              const value = e.target.value;
              setInputValue(value);
              handleInput(value);
            }}
          />
          {property?.isCustomAnim && <DeleteBtn onDelete={onDelete} />}
        </div>
      </div>
      {/* required message */}
      {property?.isRequired && isDataValid && (
        <p className="text-white text-sm">Field is Required</p>
      )}
    </div>
  );
};

export default SliderField;
