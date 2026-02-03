import React, { useState } from "react";
import WCFABLabel from "@/components/animations/blocks/WCFABLabel";
import { Settings03Icon } from "@hugeicons/core-free-icons";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import WCFABCssInput from "@/components/animations/blocks/WCFABCssInput";
import WCFABDeleteBtn from "@/components/animations/blocks/WCFABDeleteBtn";
import { HugeiconsIcon } from "@hugeicons/react";
import WCFABColorPicker from "@/components/animations/blocks/WCFABColorPicker";
import { Button } from "@/components/ui/button";

const StrokeField = ({
  property = {},
  value = {},
  onValueChange = () => {},
  onDisabledUpdate = () => {},
  onDelete = () => {},
}) => {
  const {
    title = "Stroke",
    tooltipContent = "Stroke Value",
    min = 0,
    max = 0,
    path = "",
    isRequired = false,
    isCustomAnim = true,
    ...rest
  } = property || {};

  //   const [stroke, setStroke] = useState(() => {
  //     const parsedValue = parseStrokeValues(value, "px");
  //     return {
  //       size: parsedValue.size ?? 0,
  //       unit: parsedValue.unit ?? "px",
  //       color: parsedValue.color ?? "#000000",
  //     };
  //   });
  const [isDataValid, setIsDataValid] = useState(false);

  //   // helper to send data to HOC
  //   const updateStroke = (next) => {
  //     const updatedValues = { ...stroke, ...next };
  //     setStroke(updatedValues);
  //     onValueChange(buildStrokeValues(updatedValues));
  //   };

  return (
    <div className="w-64 h-7 p-0.5">
      <div className="h-7 flex justify-between items-center rounded-lg">
        {/* left label + tooltip */}
        <WCFABLabel title={title} tooltipContent={tooltipContent} />

        <div className="w-12 h-7 flex items-center gap-2">
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
            <PopoverContent className="max-w-[150px] h-21 bg-[#303033] rounded-md p-2.5 flex flex-col gap-2">
              <div className="[&>div]:!bg-background-sidebar [&>div]:!min-w-[130px] [&>div:hover]:!bg-background-sidebar [&>div:focus-visible]:!bg-background-sidebar [&_button]:!bg-[#303033]">
                <WCFABCssInput
                  property={property}
                  value={value}
                  onValueChange={onValueChange}
                />
              </div>
              {/* color picker field */}
              <div className="[&_input]:!bg-background-sidebar [&_input:hover]:!bg-background-sidebar [&_input:focus-visible]:!bg-background-sidebar">
                <WCFABColorPicker />
              </div>
            </PopoverContent>
          </Popover>
          {/* delete button */}
          {isCustomAnim && <WCFABDeleteBtn onDelete={onDelete} />}
        </div>
      </div>

      {/* required message */}
      {isRequired && isDataValid && (
        <p className="text-white text-sm">Field is Required</p>
      )}
    </div>
  );
};

export default StrokeField;
