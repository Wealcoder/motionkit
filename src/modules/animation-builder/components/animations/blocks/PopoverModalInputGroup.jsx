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
} from "@/components/ui/selectDC";
import { cssUnits } from "@/config/dynamicPropertiesData";

const PopoverModalInputGroup = ({
  property = {},
  value = "",
  onValueChange = () => {},
  onUnitChange = () => {},
}) => {
  const {
    title = "Offset X",
    unit = "px",
    icon = null,
    path = "",
    isUnitSelection = false,
    ...rest
  } = property;

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
          onChange={(e) => onValueChange(e.target.value)}
        />
        {icon && (
          <InputGroupAddon className="mr-1.5 p-0 w-[13px] h-[13px]">
            {icon}
          </InputGroupAddon>
        )}

        {isUnitSelection ? (
          <InputGroupAddon align="inline-end" className="text-foreground p-0">
            <Select>
              <SelectTrigger className="!pl-[6px] !py-[2px] !pr-[2px] [&_svg]:hidden !text-foreground font-inter text-xss font-normal leading-4.25 tracking-normal border-none outline-none focus-visible:ring-0 rounded-5 cursor-pointer">
                <SelectValue placeholder={unit} />
              </SelectTrigger>
              <SelectContent className="min-w-[46px] bg-select-secondary text-foreground rounded-5 border-none shadow-md overflow-hidden w-[--radix-select-trigger-width] max-w-full">
                {cssUnits?.map((field, index) => (
                  <SelectItem
                    key={index}
                    value={field.value}
                    className="relative flex justify-center items-center w-full rounded-5 my-[2px] !p-0.5 cursor-pointer outline-none transition-colors hover:bg-select-hover data-[highlighted]:bg-select-hover data-[state=checked]:bg-select-hover text-xss"
                  >
                    {field.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </InputGroupAddon>
        ) : (
          <InputGroupAddon
            align="inline-end"
            className="p-0 ml-1.5 text-[11px] font-normal leading-4.25 text-foreground-secondary"
          >
            {unit}
          </InputGroupAddon>
        )}
      </InputGroup>
    </div>
  );
};

export default PopoverModalInputGroup;
