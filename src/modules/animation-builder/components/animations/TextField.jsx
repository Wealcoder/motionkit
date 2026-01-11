import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { debounceFn } from "@/utils/utils";
import ToolTipWrapper from "../common/ToolTipWrapper";
import DeleteBtn from "./shared/DeleteBtn";

const TextField = ({
  label = "label",
  tooltipContent = "Enter the value.",
  value = "",
  isRequired = false,
  isCustomAnim = true,
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
    <div className="p-2">
      <div className="flex flex-col justify-between gap-3 rounded-lg sm:flex-row sm:items-center">
        {/* left label + tooltip */}
        <div className="flex items-center gap-3 text-[#E4E4E7]">
          <h2 className="text-white text-sm">{label}</h2>
          {tooltipContent && <ToolTipWrapper text={tooltipContent} />}
        </div>

        {/* right add + delete button */}
        <div className="flex items-center gap-2">
          <Input
            placeholder=".start_trigger"
            className="flex items-center justify-center w-62.75"
            value={currentValue}
            type="text"
            onChange={(e) => {
              const value = e.target.value;
              handleUpdate(value);
            }}
          />
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

export default TextField;
