import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import {
  Delete01Icon,
  InformationCircleIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { debounceFn } from "../lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

const SliderField = ({
  label = "Scale",
  tooltipContent = "Adjust scale value",
  value = 0,
  config = {
    min: 0,
    max: 0,
    step: 1,
  },
  isRequired = false,
  isValid = () => {},
  onUpdateValue = () => {},
  onDisabledUpdate = () => {},
  onDelete,
  isCustomAnim = true,
}) => {
  const [inputValue, setInputValue] = useState(value ?? 0);
  console.log(inputValue);
  const [isDataValid, setIsDataValid] = useState(false);

  // input handler
  const handleInput = debounceFn((rewValue) => {
    if (rewValue === "" || rewValue === "-") return;

    let currentValue = Number(rewValue);
    if (isNaN(currentValue)) return;

    if (config?.min !== 0 || config?.max !== 0) {
      if (currentValue < config?.min) currentValue = config?.min;
      if (currentValue > config?.max) currentValue = config?.max;
      setInputValue(currentValue);
      onUpdateValue(currentValue);
      return;
    }
    setInputValue(currentValue);
    onUpdateValue(currentValue);
  }, 150);

  return (
    <div className="p-2">
      <div className="flex flex-col gap-3 rounded-lg  sm:flex-row sm:items-center">
        {/* left label + tooltip */}
        <div className="flex items-center gap-3 text-[#E4E4E7]">
          <h2 className="text-white text-sm">{label}</h2>
          <Tooltip>
            <TooltipTrigger asChild>
              <button>
                <HugeiconsIcon
                  icon={InformationCircleIcon}
                  className="w-2.5 h-2.5"
                />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{tooltipContent}</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* middle slider */}
        <div className="flex-1">
          <Slider
            value={[inputValue]}
            min={config?.min === 0 ? Infinity : config?.min}
            max={config?.max === 0 ? Infinity : config?.max}
            type="number"
            step={config?.step}
            onValueChange={(v) => setInputValue(v[0])}
            className="flex-1"
          />
        </div>

        {/* right add + delete button */}
        <div className="flex items-center gap-2">
          <Input
            placeholder="Add Value"
            className="flex items-center justify-center w-28"
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
          {isCustomAnim && (
            <Button>
              <HugeiconsIcon
                icon={Delete01Icon}
                onClick={onDelete}
                className="text-[#A1A1AA]"
              />
            </Button>
          )}
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

export default SliderField;
