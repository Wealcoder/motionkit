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
  property = {},
  value = "",
  onValueChange = () => {},
}) => {
  // const {
  //   title = "title",
  //   tooltipContent = "Enter the value.",
  //   icon="",
  //   defaultUnit="px",
  //   isRequired = false,
  //   isCustomAnim = false,
  //   min = 0,
  //   max = 0,
  //   path = "",
  //   ...rest
  // } = property || {};
  return (
    <div>
      <h3>{title}</h3>
      <InputGroup>
        <InputGroupInput />
        <InputGroupAddon align="inline-end" className="pr-2.5">
          <Select >
            <SelectTrigger className="min-w-8 data-[size=default]:h-5.5 pl-1.5 py-0.5 pr-0.5 bg-[#27272A] text-[11.5px] text-[#A1A1AA] gap-0.5">
              <SelectValue placeholder="px" />
            </SelectTrigger>
            <SelectContent className="bg-[#3F3F46] w-11.5 h-50.5 p-0.5 rounded-md">
              {cssUnits.map((field, index) => (
                <SelectItem
                  key={index}
                  value={field.value}
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
