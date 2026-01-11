import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { debounceFn } from "@/utils/utils";
import ToolTipWrapper from "../common/ToolTipWrapper";
import DeleteBtn from "./shared/DeleteBtn";

const ClassSelectionField = ({
  label = "Target Class Name",
  tooltipContent = "Enter target class name.",
  value = "",
  isRequired = false,
  isCustomAnim = true,
  onDelete = () => {},
  onDisabledUpdate = () => {},
  onUpdateValue = () => {},
}) => {
  const [inputValue, setInputValue] = useState(value ?? "");
  const [isDataValid, setIsDataValid] = useState(false);

  const handleInput = debounceFn((newValue) => {
    onUpdateValue(newValue);
  }, 150);

  return (
    <div className="p-2">
      <div>
        {/* label + tooltip */}
        <div className="flex items-center gap-3 text-[#E4E4E7] mb-2">
          <h2 className="text-white text-sm">{label}</h2>
          {tooltipContent && <ToolTipWrapper text={tooltipContent} />}
        </div>

        {/*input field*/}
        <div className="relative flex items-center gap-2 mb-2 w-92 h-8.5">
          <Input
            placeholder="h1.hero_title"
            className="flex items-center justify-center w-full"
            value={inputValue}
            type="text"
            onChange={(e) => {
              const value = e.target.value;
              setInputValue(value);
              handleInput(value);
            }}
          />

          {/* inside input field- right side circle */}
          <div className="absolute right-5.5 top-0">
            <div className="absolute top-1.75 right-2 w-5 h-5 rounded-full border-2 border-[#E4E4E7]" />
            <div className="absolute top-2.25 right-4.25 h-0.75 w-0.5 bg-[#E4E4E7]" />
            <div className="absolute top-4 right-2.5 h-0.5 w-0.75 bg-[#E4E4E7]" />
            <div className="absolute -bottom-6.25 right-4.25 h-0.75 w-0.5 bg-[#E4E4E7]" />
            <div className="absolute top-4 right-5.75 h-0.5 w-0.75 bg-[#E4E4E7]" />
          </div>

          {/* delete icon */}
          <div>{isCustomAnim && <DeleteBtn onDelete={onDelete} />}</div>
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

export default ClassSelectionField;
