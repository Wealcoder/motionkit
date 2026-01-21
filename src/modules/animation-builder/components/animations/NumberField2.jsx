import React, { useState } from "react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
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
          <span className="wcf-ab-title">{title}</span>
          {tooltipContent && <ToolTipWrapper text={tooltipContent} />}
        </div>

        {/* right add + delete button */}
        <div className="flex-1 flex justify-end items-center gap-3">
          <InputGroup className="wcf-ab-dynamic-field-input px-1">
            <InputGroupInput
              placeholder="Add Value"
              className="!text-white text-input-font-size font-normal leading-18 tracking-normal"
              value={inputValue}
              min={min}
              max={max}
              step={step}
              type="number"
              onChange={(e) => {
                const value = e.target.value;
                handleInput(value);
              }}
            />
            {/* plus - minus icon */}
            <InputGroupAddon align="inline-end" className={"pr-[6px]"}>
              <InputGroupButton
                className="wcf-ab-button-icon hover:bg-background-topbar active:bg-background-topbar border-r-[1px] border-r-[#71717A] rounded-r-none"
                onClick={() => updateValue(inputValue - step)}
              >
                <HugeiconsIcon
                  icon={MinusSignIcon}
                  className="text-[#E4E4E7]"
                />
              </InputGroupButton>
            </InputGroupAddon>
            <InputGroupAddon align="inline-end">
              <InputGroupButton
                className="wcf-ab-button-icon hover:bg-background-topbar active:bg-background-topbar border-l-[1px]  border-l-[#71717A] rounded-l-none"
                onClick={() => updateValue(inputValue + step)}
              >
                <HugeiconsIcon icon={PlusSignIcon} className="text-[#E4E4E7]" />
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
