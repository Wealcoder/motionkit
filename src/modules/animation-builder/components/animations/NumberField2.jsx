import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { MinusSignIcon, PlusSignIcon } from "@hugeicons/core-free-icons";
import { debounceFn } from "@/utils/utils";
import ToolTipWrapper from "@/components/common/ToolTipWrapper";
import DeleteBtn from "@/components/animations/shared/DeleteBtn";

const NumberField2 = ({
  property = {},
  value = 0,
  onDelete = () => {},
  onDisabledUpdate = () => {},
  onUpdateValue = () => {},
}) => {
  const {
    title = "title",
    tooltipContent = "Enter the value.",
    isRequired = false,
    isCustomAnim = true,
    min = 0,
    max = 0,
    step = 0.1,
    ...rest
  } = property || {};

  const [inputValue, setInputValue] = useState(value || 0);
  const [isDataValid, setIsDataValid] = useState(false);

  const round = (value) => Math.round(value * 100) / 100;

  // value handler
  const commitValue = (rawValue) => {
    let updateValue = Number(rawValue);
    if (Number.isNaN(updateValue)) return;

    updateValue = Math.min(max, Math.max(min, updateValue));
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
    <div>
      <div className="flex flex-col justify-between gap-3 w-97 h-8.5 mx-auto rounded-lg sm:flex-row sm:items-center">
        {/* left title + tooltip */}
        <div className="flex items-center gap-3 text-[#E4E4E7]">
          <span className="text-white text-15 font-normal leading-5 tracking-normal">
            {title}
          </span>
          {tooltipContent && <ToolTipWrapper text={tooltipContent} />}
        </div>

        {/* right add + delete button */}
        <div className="flex-1 flex justify-end items-center gap-3">
          <div className="relative">
            <Input
              placeholder="Add Value"
              className="h-[34px] max-w-52 px-3 py-2 bg-background-input hover:bg-input-hover focus:bg-input-focus text-input-placeholder placeholder:text-input-placeholder hover:text-input-text-hover focus:text-input-text-focus text-sm font-medium leading-[18px] border-none outline-none ring-0 focus:ring-0 rounded-5 cursor-text"
              value={inputValue}
              min={min}
              max={max}
              step={step}
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
                onClick={() => updateValue(inputValue - step)}
              >
                <HugeiconsIcon
                  icon={MinusSignIcon}
                  className="text-[#E4E4E7]"
                />
              </Button>
              <div className="w-px h-5.5 bg-[#71717A]" />

              <Button
                size="icon"
                onClick={() => updateValue(inputValue + step)}
              >
                <HugeiconsIcon icon={PlusSignIcon} className="text-[#E4E4E7]" />
              </Button>
            </div>
          </div>
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

export default NumberField2;
