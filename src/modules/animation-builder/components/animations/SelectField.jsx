import React, { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ToolTipWrapper from "@/components/common/ToolTipWrapper";
import DeleteBtn from "@/components/animations/shared/DeleteBtn";
import { toCamelCase } from "@/utils/utils";

const SelectField = ({
  property = {},
  value = "",
  onDelete = () => {},
  onDisabledUpdate = () => {},
  onValueChange = () => {},
}) => {
  const {
    title = "Label",
    tooltipContent = "Select Method",
    isRequired = false,
    isCustomAnim = false,
    fieldData = [],
    ...rest
  } = property || {};

  const [selectedValue, setSelectedValue] = useState(value ?? "");
  const [isDataValid, setIsDataValid] = useState(false);

  const handleSelect = (value) => {
    console.log({ value });
    setSelectedValue(value);
    onValueChange(value);
  };

  if (!fieldData?.length) {
    console.error("Field data required!");
    return null;
  }

  return (
    <div>
      <div className="flex flex-col justify-between gap-3 rounded-lg sm:flex-row sm:items-center">
        {/* left title + tooltip */}
        <div className="flex items-center gap-[6px]">
          <span className="wcf-ab-title">{title}</span>
          {tooltipContent && <ToolTipWrapper text={tooltipContent} />}
        </div>
        <div className="flex-1 flex justify-end items-center gap-3">
          <Select value={selectedValue} onValueChange={handleSelect}>
            <SelectTrigger className="wcf-ab-select-trigger">
              <SelectValue placeholder="Select Method" />
            </SelectTrigger>
            <SelectContent className="wcf-ab-select-content">
              {fieldData?.map((field, index) => {
                // if field does not contain value use title (formatting camel case) as value
                const isObjectType =
                  !Array.isArray(field) && typeof field === "object";
                const currentValue = isObjectType
                  ? field?.value
                  : toCamelCase(field);
                const title = isObjectType ? field?.title : field;
                return (
                  <SelectItem key={index} value={currentValue ?? undefined}>
                    {title ?? ""}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
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
export default SelectField;
