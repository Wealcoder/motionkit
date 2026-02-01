import React from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

const WCFABRadio = ({defaultValue, handleChange}) => {
    console.log(defaultValue)
  return (
    <div>
      <RadioGroup
        defaultValue={defaultValue}
        onValueChange={handleChange}
        className="flex items-center gap-3 w-38.5"
      >
        <div className="flex items-center gap-2 w-16.5">
          <RadioGroupItem
            value="drawin"
            id="draw-in"
            className="size-3.5 border-none rounded-full !p-0 bg-button  data-[state=checked]:bg-[#2C76E6] [&_svg]:hidden focus-visible:ring-0"
          />
          <Label
            htmlFor="draw-in"
            className="text-[#A1A1AA] text-[11.5px] font-normal leading-4.5"
          >
            Draw In
          </Label>
        </div>
        <div className="flex items-center gap-2 w-19">
          <RadioGroupItem
            value="drawout"
            id="draw-out"
            className="size-3.5 border-none rounded-full !p-0 bg-button data-[state=checked]:bg-[#2C76E6] [&_svg]:hidden focus-visible:ring-0"
          />
          <Label
            htmlFor="draw-out"
            className="text-[#A1A1AA] text-[11.5px] font-normal leading-4.5"
          >
            Draw Out
          </Label>
        </div>
      </RadioGroup>
    </div>
  );
};

export default WCFABRadio;
