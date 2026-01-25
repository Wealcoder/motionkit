import React, { useState } from "react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { HugeiconsIcon } from "@hugeicons/react";
import { MinusSignIcon, PlusSignIcon } from "@hugeicons/core-free-icons";
import { debounceFn, trimString } from "@/utils/utils";
import ToolTipWrapper from "@/components/common/ToolTipWrapper";
import DeleteBtn from "@/components/animations/shared/DeleteBtn";

const NumberField2 = ({
  property = {},
  value = 0,
  onDelete = () => {},
  onDisabledUpdate = () => {},
  onValueChange = () => {},
}) => {
  const {
    title = "title",
    tooltipContent = "Enter the value.",
    isRequired = false,
    isCustomAnim = false,
    min = 0,
    max = 0,
    step = 0.1,
    ...rest
  } = property || {};

  const [inputValue, setInputValue] = useState(value || 0);
  const [isDataValid, setIsDataValid] = useState(false);

  // value handler
  const commitValue = (rawValue) => {
    let updateValue = Number(rawValue);
    if (Number.isNaN(updateValue)) return;
    setInputValue(updateValue);
    onValueChange(updateValue);
  };

  // input handler
  const handleInput = debounceFn((value) => {
    commitValue(Number(value)?.toFixed(2));
  }, 150);

  // plus minus button click handler
  const updateValue = (value) => {
    commitValue(Number(value)?.toFixed(2));
  };

  return (
    <div>
      <div className="flex flex-col justify-between gap-3 w-97 h-8.5 mx-auto rounded-lg sm:flex-row sm:items-center">
        {/* left title + tooltip */}
        <div className="flex items-center gap-[6px]">
          <span className="wcf-ab-title">{trimString(title, 15)}</span>
          {tooltipContent && <ToolTipWrapper text={tooltipContent} />}
        </div>

        {/* right add + delete button */}
        <div className="flex-1 flex justify-end items-center gap-3">
          <InputGroup className="wcf-ab-number-input px-1">
            <InputGroupInput
              placeholder="Add Value"
              className="!text-input-font-size font-normal leading-18 tracking-normal"
              value={inputValue}
              min={min}
              max={max}
              step={step}
              type="number"
              onChange={(e) => handleInput(e.target.value)}
            />
            {/* plus - minus icon */}
            <InputGroupAddon align="inline-end" className={"pr-[6px]"}>
              <InputGroupButton
                className="wcf-ab-button-icon bg-[--background-secondary] hover:bg-[--button-primary-hover] active:bg-[--button-primary-hover] border-r border-r-[#71717A] rounded-r-none rounded-l-5"
                onClick={() => updateValue(inputValue - step)}
              >
                <HugeiconsIcon
                  icon={MinusSignIcon}
                  strokeWidth={2}
                  className="text-foreground"
                />
              </InputGroupButton>
            </InputGroupAddon>
            <InputGroupAddon align="inline-end">
              <InputGroupButton
                className="wcf-ab-button-icon bg-[--background-secondary] hover:bg-[--button-primary-hover] active:bg-[--button-primary-hover] border-l  border-l-[#71717A] rounded-l-none rounded-r-5"
                onClick={() => updateValue(inputValue + step)}
              >
                <HugeiconsIcon
                  icon={PlusSignIcon}
                  strokeWidth={2}
                  className="text-foreground"
                />
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
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
