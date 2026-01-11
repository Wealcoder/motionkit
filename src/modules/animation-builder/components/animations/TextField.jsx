import React, { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  InformationCircleFreeIcons,
  Delete01Icon,
} from "@hugeicons/core-free-icons";
import { debounceFn } from "@/utils/utils";

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
  const [value, setValue] = useState(value ?? "");
  const [isDataValid, setIsDataValid] = useState(false);

  const handleUpdate = debounceFn((newValue) => {
    setValue(newValue);
    onUpdateValue(newValue);
  }, 150);

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
                  icon={InformationCircleFreeIcons}
                  className="w-2.5 h-2.5"
                />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{tooltipContent}</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* right add + delete button */}
        <div className="flex items-center gap-2">
          <Input
            placeholder=".start_trigger"
            className="flex items-center justify-center w-62.75"
            value={value}
            type="text"
            onChange={(e) => {
              const value = e.target.value;
              handleUpdate(value);
            }}
          />
          {isCustomAnim && (
            <Button size="icon">
              <HugeiconsIcon
                icon={Delete01Icon}
                onClick={onDelete}
                className="text-[#A1A1AA]"
              />
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

export default TextField;
