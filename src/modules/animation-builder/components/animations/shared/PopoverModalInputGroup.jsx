import React from "react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";

const PopoverModalInputGroup = ({
  title,
  icon,
  value,
  unit,
  onValueChange = () => {},
  onUnitChange = () => {},
}) => {
  return (
    <div className="h-[50px] max-w-[84px] flex flex-col gap-1.5">
      <h2 className="text-[11px] font-normal text-[#E4E4E7] m-0 font-inter">
        {title}
      </h2>
      <InputGroup className="border-none bg-background-sidebar w-full h-[27px] pl-2.5 pr-3 py-[5px] has-[[data-slot=input-group-control]:focus-visible]:ring-0 has-[>[data-align=inline-end]]:[&>input]:-pr-1">
        <InputGroupInput
          className="!text-[11px] !placeholder:text-[11px] placeholder:text-foreground-secondary font-normal leading-4.25 text-[#FAFAFA] p-0 h-[27px]"
          type="number"
          value={value}
          placeholder={value}
          onChange={(e) => onValueChange(e.target.value)}
        />
        <InputGroupAddon className="mr-1.5 p-0 w-[13px] h-[13px]">
          {icon}
        </InputGroupAddon>
        <InputGroupAddon
          align="inline-end"
          className="p-0 ml-1.5 text-[11px] font-normal leading-4.25 text-foreground-secondary"
        >
          {unit}
        </InputGroupAddon>
      </InputGroup>
    </div>
  );
};

export default PopoverModalInputGroup;
