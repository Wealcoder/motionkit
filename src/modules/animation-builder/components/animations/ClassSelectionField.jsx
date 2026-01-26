import React, { useState } from "react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { debounceFn, trimString } from "@/utils/utils";
import ToolTipWrapper from "@/components/common/ToolTipWrapper";
import { HugeiconsIcon } from "@hugeicons/react";
import { Target03Icon } from "@hugeicons/core-free-icons/index";

const ClassSelectionField = ({
  property = {},
  value = "",
  onDelete = () => {},
  onDisabledUpdate = () => {},
  onValueChange = () => {},
}) => {
  const {
    title = "Target Class Name",
    tooltipContent = "Enter target class name.",
    isRequired = false,
    isCustomAnim = false,
    ...rest
  } = property || {};

  const [inputValue, setInputValue] = useState(value ?? "");
  const [isDataValid, setIsDataValid] = useState(false);

  const handleInput = debounceFn((newValue) => {
    onValueChange(newValue);
  }, 150);

  return (
    <div>
      <div>
        {/* title + tooltip */}
        <div className="flex items-center gap-[6px] mb-1">
          <span className="wcf-ab-title">{trimString(title, 15)}</span>
          {property?.tooltipContent && (
            <ToolTipWrapper text={property?.tooltipContent} />
          )}
        </div>

        {/*input field*/}
        <InputGroup className="wcf-ab-text-input max-w-none px-[10px] ">
          <InputGroupInput
            placeholder="h1.hero_title"
            className="p-0 !text-xss font-normal leading-18 tracking-normal"
            value={inputValue}
            type="text"
            onChange={(e) => {
              const value = e.target.value;
              setInputValue(value);
              handleInput(value);
            }}
          />
          <InputGroupAddon align="inline-end" className="pr-0">
            <InputGroupButton
              className={
                "bg-transparent border-none outline-none shadow-none hover:rounded-full cursor-pointer hover:scale-125"
              }
            >
              <HugeiconsIcon
                icon={Target03Icon}
                size={12}
                strokeWidth={2}
                color="#fafafa"
              />
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
      </div>

      {/* required message */}
      {isRequired && isDataValid && (
        <p className="text-white text-sm">Field is Required</p>
      )}
    </div>
  );
};

export default ClassSelectionField;
