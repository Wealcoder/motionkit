import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { debounceFn } from "@/utils/utils";
import ToolTipWrapper from "@/components/common/ToolTipWrapper";
import DeleteBtn from "@/components/animations/shared/DeleteBtn";

const TextField = ({
  property = {
    title: "title",
    tooltipContent: "Enter the value.",
    isRequired: false,
    isCustomAnim: true,
    ...rest,
  },
  value = "",
  onDelete = () => {},
  onDisabledUpdate = () => {},
  onUpdateValue = () => {},
}) => {
  const [currentValue, setCurrentValue] = useState(value ?? "");
  const [isDataValid, setIsDataValid] = useState(false);

  const handleUpdate = debounceFn((newValue) => {
    setCurrentValue(newValue);
    onUpdateValue(newValue);
  }, 150);

  return (
    <div>
      <div className="flex flex-col justify-between gap-3 rounded-lg sm:flex-row sm:items-center">
        {/* left title + tooltip */}
        <div className="flex items-center gap-3 text-[#E4E4E7]">
          <span className="text-white text-15 font-normal leading-5 tracking-normal">
            {property?.title ?? ""}
          </span>
          {property?.tooltipContent && (
            <ToolTipWrapper text={property?.tooltipContent} />
          )}
        </div>

        {/* right add + delete button */}
        <div className="flex-1 flex justify-end items-center gap-3">
          <Input
            placeholder=".start_trigger"
            className="h-[34px] max-w-52 px-3 py-2 bg-background-input hover:bg-input-hover focus:bg-input-focus text-input-placeholder placeholder:text-input-placeholder hover:text-input-text-hover focus:text-input-text-focus text-sm font-medium leading-[18px] border-none outline-none ring-0 focus:ring-0 rounded-5 cursor-text"
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
        <p className="text-white text-sm">Field is Required</p>
      )}
    </div>
  );
};

export default TextField;
