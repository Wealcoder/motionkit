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

const SelectField = ({
  property = {
    title: "Method",
    tooltipContent: "Select Method",
    isRequired: false,
    isCustomAnim: true,
    fieldData: [],
    ...rest,
  },
  value = "",
  onDelete = () => {},
  onDisabledUpdate = () => {},
  onUpdateValue = () => {},
}) => {
  const [selectedValue, setSelectedValue] = useState(value ?? "");
  const [isDataValid, setIsDataValid] = useState(false);

  const handleSelect = (value) => {
    setSelectedValue(value);
    onUpdateValue(value);
  };

  if (!property?.fieldData?.length) {
    console.error("Field data required!");
    return;
  }

  return (
    <div>
      <div className="flex flex-col justify-between gap-3 rounded-lg sm:flex-row sm:items-center">
        {/* left title + tooltip */}
        <div className="flex items-center gap-3 text-[#E4E4E7]">
          <span className="text-white text-15 font-normal leading-5 tracking-normal">
            {property?.title}
          </span>
          {property?.tooltipContent && (
            <ToolTipWrapper text={property?.tooltipContent} />
          )}
        </div>
        <div className="flex-1 flex justify-end items-center gap-3">
          {console.log({ data: property?.fieldData })}
          <Select value={selectedValue} onValueChange={handleSelect}>
            <SelectTrigger className="h-[34px] max-w-52 px-3 py-2 bg-background-input hover:bg-input-hover focus:bg-input-focus text-input-placeholder placeholder:text-input-placeholder hover:text-input-text-hover focus:text-input-text-focus text-sm font-medium leading-[18px] border-none outline-none rounded-5 cursor-pointer">
              <SelectValue placeholder="Select Method" />
            </SelectTrigger>
            <SelectContent>
              {property?.fieldData?.map((field, index) => (
                <SelectItem key={index} value={field?.value ?? undefined}>
                  {field?.title ?? ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
export default SelectField;
