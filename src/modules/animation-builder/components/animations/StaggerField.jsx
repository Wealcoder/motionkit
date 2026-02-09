import React, { useState } from "react";
import WCFABLabel from "@/components/animations/blocks/WCFABLabel";
import WCFABDeleteBtn from "@/components/animations/blocks/WCFABDeleteBtn";
import WCFABErrorMessage from "@/components/animations/blocks/WCFABErrorMessage";
import WCFABNumberInput from "@/components/animations/blocks/WCFABNumberInput";
import StaggerPopoverDialog from "@/components/animations/blocks/StaggerPopoverDialog";
import WCFABSettingBtn from "@/components/animations/blocks/WCFABSettingBtn";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";


const StaggerField = ({
  property = {},
  value,
  onValueChange = () => {},
  onDisabledUpdate = () => {},
  onDelete = () => {},
}) => {
  // default value
  const {
    title = "title",
    tooltipContent = "Enter the value.",
    isRequired = false,
    isCustomAnim = true,
    min = 0,
    max = 0,
    path = "",
    ...rest
  } = property || {};

  const [isDataValid, setIsDataValid] = useState(false);

  return (
    <div>
      <div className="w-full flex justify-between items-center">
        <WCFABLabel title={title} tooltipContent={tooltipContent} />

        <div className="flex items-center gap-2">
          <WCFABNumberInput property={property} />

          <Popover>
            <PopoverTrigger asChild>
              <WCFABSettingBtn />
            </PopoverTrigger>
            <PopoverContent
              align="end"
              className="bg-[#18181B] w-[287px] min-h-[301px] p-0"
            >
              <StaggerPopoverDialog/>
            </PopoverContent>
          </Popover>

          {/* delete button */}
          {isCustomAnim && <WCFABDeleteBtn onDelete={onDelete} />}
        </div>
      </div>
      {/* required message */}
      {isRequired && isDataValid && (
        <WCFABErrorMessage message={"This field is required"} />
      )}
    </div>
  );
};

export default StaggerField;
