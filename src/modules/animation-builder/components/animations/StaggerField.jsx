import React, { useState } from "react";
import WCFABLabel from "@/components/animations/blocks/WCFABLabel";
import WCFABDeleteBtn from "@/components/animations/blocks/WCFABDeleteBtn";
import WCFABErrorMessage from "@/components/animations/blocks/WCFABErrorMessage";
import WCFABNumberInput from "@/components/animations/blocks/WCFABNumberInput";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Settings03Icon } from "@hugeicons/core-free-icons/index";
import StaggerPopoverModal from "./shared/StaggerPopoverModal";

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
          <WCFABNumberInput
            property={property}
            // value={inputValue}
            // onValueChange={(value) => {
            //   setInputValue(value);
            //   handleInput(value);
            // }}
          />

          <Popover>
            <PopoverTrigger asChild>
              <Button className="wcf-ab-button-icon">
                <HugeiconsIcon
                  icon={Settings03Icon}
                  color="#A1A1AA"
                  strokeWidth={1.5}
                  className="w-3.5 h-3.5 text-white"
                />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              align="end"
              className="bg-popover w-[176px] h-[424px] p-3 flex flex-col gap-2.5"
            >
              <StaggerPopoverModal />
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
