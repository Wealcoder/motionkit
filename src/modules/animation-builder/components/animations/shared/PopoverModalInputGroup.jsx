import React from "react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cssUnits } from "@/config/animationsProperties";
import { ArrowHorizontalIcon } from "@hugeicons/core-free-icons/index";
import { HugeiconsIcon } from "@hugeicons/react";

const PopoverModalInputGroup = ({
  title="Offset X",
  icon = <HugeiconsIcon icon={ArrowHorizontalIcon} className="text-[#E4E4E7]"/>,
  value="100000",
  unit="px",
  onValueChange = () => {},
  onUnitChange = () => {},
}) => {
  return (
    <div className="h-[50px] max-w-[84px] flex flex-col gap-1.5">
      <h2 className="text-[11px] font-normal text-[#E4E4E7] m-0 font-inter">
        {title}
      </h2>
      <InputGroup className="border-none bg-[#18181B] w-full h-[27px] pl-2.5 pr-3 py-[5px] has-[[data-slot=input-group-control]:focus-visible]:ring-0 has-[>[data-align=inline-end]]:[&>input]:-pr-1  [&_[data-slot=input-group-input]]:text-[11px]
    [&_[data-slot=input-group-input]]:placeholder:text-[11px]">
        <InputGroupInput
          className="!text-[11px] !placeholder:text-[11px] font-normal leading-4.25 text-[white] p-0"
          type="number"
          value={value}
        //   onChange={(e) => onValueChange(e.target.value)}
        />
        <InputGroupAddon className="mr-1.5 p-0">
        {icon}
        </InputGroupAddon>
        <InputGroupAddon align="inline-end" className="p-0">
          <Select>
            <SelectTrigger className="data-[size=default]:h-[27px] text-[11px] border-none shadow-none text-[#A1A1AA] gap-0.5 [&>svg]:hidden p-1">
              <SelectValue placeholder={unit} />
            </SelectTrigger>
            <SelectContent className="bg-[#3F3F46] min-w-0 max-w-[46px] max-h-[202px] p-0 rounded-md">
              {cssUnits.map((field, index) => (
                <SelectItem
                  key={index}
                  value={field.value}
                  className="text-[#A1A1AA] focus:bg-[#202024] rounded-md w-10.5 h-5.5 pl-1.5 py-0.5 pr-0.5 text-[11.5px]"
                >
                  {field.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </InputGroupAddon>
      </InputGroup>
    </div>
  );
};

export default PopoverModalInputGroup;
