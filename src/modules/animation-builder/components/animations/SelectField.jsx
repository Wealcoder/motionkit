import React, { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ToolTipWrapper from "../common/ToolTipWrapper";
import DeleteBtn from "./shared/DeleteBtn";

const SelectField = ({
  label = "Method",
  tooltipContent = "Select Method",
  value = "",
  fieldData = [],
  isRequired = false,
  isCustomAnim = true,
  onDelete = () => {},
  onDisabledUpdate = () => {},
  onUpdateValue = () => {},
}) => {
  const [selectedValue, setSelectedValue] = useState(value ?? "");
  // console.log(selectedValue);
  const [isDataValid, setIsDataValid] = useState(false);

  const handleSelect = (value) => {
    setSelectedValue(value);
    onUpdateValue(value);
  };

  return (
    <div className="p-2">
      <div className="flex flex-col justify-between gap-3 rounded-lg sm:flex-row sm:items-center">
        {/* left label + tooltip */}
        <div className="flex items-center gap-3 text-[#E4E4E7]">
          <h2 className="text-white text-sm">{label}</h2>
          {tooltipContent && <ToolTipWrapper text={tooltipContent} />}
        </div>

        <div className="flex items-center gap-3">
          <Select value={selectedValue} onValueChange={handleSelect}>
            <SelectTrigger className="w-62.75">
              <SelectValue placeholder="Select Method" />
            </SelectTrigger>
            <SelectContent>
              {fieldData?.map((field, index) => (
                <SelectItem key={index} value={field?.value ?? ""}>
                  {field?.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

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
export default SelectField;
