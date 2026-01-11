import React, { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  InformationCircleIcon,
  MinusSignIcon,
  PlusSignIcon,
  Delete01Icon,
} from "@hugeicons/core-free-icons";
import { debounceFn } from "@/utils/utils";

const NumberField2 = ({
  label = "label",
  tooltipContent = "Enter the value.",
  value = 0,
  config = {
    min: 0,
    max: 0,
    step: 0.1,
  },
  isRequired = false,
  isCustomAnim = true,
  onDelete = () => {},
  onDisabledUpdate = () => {},
  onUpdateValue = () => {},
}) => {
  const [inputValue, setInputValue] = useState(0);
  const [isDataValid, setIsDataValid] = useState(false);

  const round = (value) => Math.round(value * 100) / 100;

  // value handler
  const commitValue = (rawValue) => {
    let updateValue = Number(rawValue);
    if (Number.isNaN(updateValue)) return;

    updateValue = Math.min(config.max, Math.max(config.min, updateValue));
    updateValue = round(updateValue);

    setInputValue(updateValue);
    onUpdateValue(updateValue);
  };

  // input handler
  const handleInput = debounceFn((value) => {
    commitValue(value);
  }, 150);

  // plus minus button click handler
  const updateValue = (step) => {
    commitValue(step);
  };

  return (
    <div className="p-2">
      <div className="flex flex-col justify-between gap-3 w-97 h-8.5 mx-auto rounded-lg sm:flex-row sm:items-center">
        {/* left label + tooltip */}
        <div className="flex items-center gap-3 text-[#E4E4E7]">
          <h2 className="text-white w-9.25 text-sm">{label}</h2>
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

        {/* right add + delete button */}
        <div className="flex items-center gap-2 ">
          <div className="relative">
            <Input
              placeholder="Add Value"
              className="flex items-center justify-center w-62.5"
              value={inputValue}
              min={config.min}
              max={config.max}
              step={config.step}
              type="number"
              onChange={(e) => {
                const value = e.target.value;
                setInputValue(value);
                handleInput(value);
              }}
            />
            {/* plus - minus icon */}
            <div className="flex items-center justify-between absolute w-12.25 right-2 top-1.25 bg-[#52525B] px-1 h-5.5 rounded-sm">
              <Button
                size="icon"
                onClick={() => updateValue(inputValue - config.step)}
              >
                <HugeiconsIcon
                  icon={MinusSignIcon}
                  className="text-[#E4E4E7]"
                />
              </Button>
              <div className="w-px h-5.5 bg-[#71717A]" />

              <Button
                size="icon"
                onClick={() => updateValue(inputValue + config.step)}
              >
                <HugeiconsIcon icon={PlusSignIcon} className="text-[#E4E4E7]" />
              </Button>
            </div>
          </div>
          {isCustomAnim && (
            <Button size="icon">
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

export default NumberField2;
