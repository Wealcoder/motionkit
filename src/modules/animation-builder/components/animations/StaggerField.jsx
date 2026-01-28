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
import {
  CancelCircleIcon,
  Settings03Icon,
} from "@hugeicons/core-free-icons/index";
 import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const StaggerField = ({
  property = {},
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
              <div className="flex justify-end">
                <HugeiconsIcon
                  icon={CancelCircleIcon}
                  size={15}
                  className="text-foreground-secondary w-3 h-3"
                />
              </div>
              <div className="flex flex-col gap-1.5 [&_input]:!bg-background-sidebar [&_input]:!max-w-[152px] [&_input:hover]:!bg-background-sidebar [&_input:focus-visible]:!bg-background-sidebar">
                <h2 className="text-[11px] font-normal text-[#E4E4E7] m-0 font-inter">
                  Color
                </h2>
                <WCFABNumberInput
                  property={property}
                  // value={inputValue}
                  // onValueChange={(value) => {
                  //   setInputValue(value);
                  //   handleInput(value);
                  // }}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <h2 className="text-[11px] font-normal text-[#E4E4E7] m-0 font-inter">
                  form
                </h2>
                <Select>
                  <SelectTrigger className="w-full max-w-48">
                    <SelectValue placeholder="Select a fruit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Fruits</SelectLabel>
                      <SelectItem value="apple">Apple</SelectItem>
                      <SelectItem value="banana">Banana</SelectItem>
                      <SelectItem value="blueberry">Blueberry</SelectItem>
                      <SelectItem value="grapes">Grapes</SelectItem>
                      <SelectItem value="pineapple">Pineapple</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
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
