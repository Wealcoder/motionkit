import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { debounceFn } from "@/utils/utils";
import ToolTipWrapper from "@/components/common/ToolTipWrapper";
import DeleteBtn from "@/components/animations/shared/DeleteBtn";

const TextField = ({
  property = {},
  value = "",
  onDelete = () => {},
  onDisabledUpdate = () => {},
  onValueChange = () => {},
}) => {
  const {
    title = "title",
    tooltipContent = "Enter the value.",
    isRequired = false,
    isCustomAnim = false,
    ...rest
  } = property || {};

  const [currentValue, setCurrentValue] = useState(value ?? "");
  const [isDataValid, setIsDataValid] = useState(false);

  const handleUpdate = debounceFn((newValue) => {
    setCurrentValue(newValue);
    onValueChange(newValue);
  }, 150);

  return (
    <div>
      <div className="flex flex-col justify-between gap-3 rounded-lg sm:flex-row sm:items-center">
        {/* left title + tooltip */}
        <div className="flex items-center gap-[6px]">
          <span className="wcf-ab-title">{property?.title ?? ""}</span>
          {property?.tooltipContent && (
            <ToolTipWrapper text={property?.tooltipContent} />
          )}
        </div>

        {/* right add + delete button */}
        <div className="flex-1 flex justify-end items-center gap-3">
          <Input
            placeholder=".start_trigger"
            className="wcf-ab-dynamic-field-input"
            value={currentValue}
            type="text"
            onChange={(e) => {
              const value = e.target.value;
              handleUpdate(value);
            }}
          />
          {property?.isCustomAnim && <DeleteBtn onDelete={onDelete} />}
        </div>
      </div>
      {/* required message */}
      {property?.isRequired && isDataValid && (
        <p className="text-white text-message">Field is Required</p>
      )}
    </div>
  );
};

export default TextField;
