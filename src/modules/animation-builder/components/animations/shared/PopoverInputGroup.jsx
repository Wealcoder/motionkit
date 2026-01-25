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

const PopoverInputGroup = ({
  title,
  value,
  unit,
  onValueChange = () => {},
}) => {
  console.log(value);
  return (
    <div className="h-[50px]">
      <h3 className="text-[11px] font-normal leading-4.25 text-[#E4E4E7] p-0">
        {title}
      </h3>
      <InputGroup className="border-none bg-[#18181B] w-[80px] h-[27px] has-[[data-slot=input-group-control]:focus-visible]:ring-0 has-[>[data-align=inline-end]]:[&>input]:-pr-1">
        <InputGroupInput
          className=" text-[11.5px] font-normal leading-4.5 text-white p-1"
          type="number"
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
        />
        <InputGroupAddon align="inline-end" className="pr-1.5">
          <Select>
            <SelectTrigger className="data-[size=default]:h-[27px] text-[11px] border-none shadow-none text-[#A1A1AA] gap-0.5 [&>svg]:hidden p-1">
              <SelectValue placeholder={unit} />
            </SelectTrigger>
            <SelectContent className="bg-[#3F3F46] w-11.5 h-50.5 p-0.5 rounded-md">
              {cssUnits.map((field, index) => (
                <SelectItem
                  key={index}
                  value={unit}
                  className="text-[#A1A1AA] focus:bg-[#27272A] focus:text-[#A1A1AA] w-10.5 h-5.5 pl-1.5 py-0.5 pr-0.5 text-[11.5px]"
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

export default PopoverInputGroup;
