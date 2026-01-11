import React, { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import {
  Delete01Icon,
  InformationCircleIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

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
          <Tooltip>
            <TooltipTrigger asChild>
              <button>
                <HugeiconsIcon
                  icon={InformationCircleIcon}
                  className="w-2.5 h-2.5"
                />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{tooltipContent}</p>
            </TooltipContent>
          </Tooltip>
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

          {isCustomAnim && (
            <Button size="icon" onClick={onDelete}>
              <HugeiconsIcon icon={Delete01Icon} className="text-[#A1A1AA]" />
            </Button>
          )}
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
