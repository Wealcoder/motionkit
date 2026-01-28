import React from "react";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { HugeiconsIcon } from "@hugeicons/react";
import { CancelCircleIcon } from "@hugeicons/core-free-icons/index";
import WCFABNumberInput from "../blocks/WCFABNumberInput";

const StaggerPopoverModal = () => {
  return (
    <>
      <div className="flex justify-end">
        <HugeiconsIcon
          icon={CancelCircleIcon}
          size={15}
          className="text-foreground-secondary w-3 h-3"
        />
      </div>
      <div className="flex flex-col gap-2.5 text-[#E4E4E7] text-[11px]">
        {/* each */}
        <div className="flex flex-col gap-1.5 [&_input]:!bg-background-sidebar [&_input]:!min-w-[152px] [&_input]:!max-w-[152px] [&_input:hover]:!bg-background-sidebar [&_input:focus-visible]:!bg-background-sidebar">
          <label className="text-[11px] font-normal text-[#E4E4E7] m-0 font-inter">
            each
          </label>
          <WCFABNumberInput />
        </div>

        {/* from */}
        <div className="flex flex-col gap-1">
          <label>from</label>
          <Select defaultValue="center">
            <SelectTrigger className="h-[27px] border-none bg-[#18181B] text-[#FAFAFA] [&>svg]:text-[#E4E4E7]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="text-[#A1A1AA]">
              <SelectItem value="start">start</SelectItem>
              <SelectItem value="center">center</SelectItem>
              <SelectItem value="end">end</SelectItem>
              <SelectItem value="edges">edges</SelectItem>
              <SelectItem value="random">random</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Axis */}
        <div className="flex flex-col gap-1">
          <label>Axis</label>
          <RadioGroup defaultValue="x" className="flex gap-4">
            <label className="flex items-center gap-2">
              <RadioGroupItem
                value="x"
                className="bg-[#18181B] data-[state=checked]:text-[#2C76E6]"
              />
              X
            </label>
            <label className="flex items-center gap-2">
              <RadioGroupItem
                value="y"
                className="bg-[#18181B] data-[state=checked]:text-[#2C76E6]"
              />
              Y
            </label>
          </RadioGroup>
        </div>

        {/* column / row */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col gap-1.5 [&_input]:!bg-background-sidebar [&_input]:!min-w-[70px] [&_input]:!max-w-[70px] [&_input:hover]:!bg-background-sidebar [&_input:focus-visible]:!bg-background-sidebar">
            <label className="text-[11px] font-normal text-[#E4E4E7] m-0 font-inter">
              column
            </label>
            <WCFABNumberInput />
          </div>
          <div className="flex flex-col gap-1.5 [&_input]:!bg-background-sidebar [&_input]:!min-w-[70px] [&_input]:!max-w-[70px] [&_input:hover]:!bg-background-sidebar [&_input:focus-visible]:!bg-background-sidebar">
            <label className="text-[11px] font-normal text-[#E4E4E7] m-0 font-inter">
              row
            </label>
            <WCFABNumberInput />
          </div>
        </div>

        {/* ease */}
        <div className="flex flex-col gap-1">
          <label>ease</label>
          <Select defaultValue="none">
            <SelectTrigger className="h-[27px] border-none bg-[#18181B] text-[#FAFAFA] [&>svg]:text-[#E4E4E7]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="text-[#A1A1AA]">
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="power1.inOut">Power1 InOut</SelectItem>
              <SelectItem value="power2.inOut">Power2 InOut</SelectItem>
              <SelectItem value="elastic.out">Elastic Out</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* repeat */}
        <div className="flex flex-col gap-1.5 [&_input]:!bg-background-sidebar [&_input]:!max-w-[154px] [&_input:hover]:!bg-background-sidebar [&_input:focus-visible]:!bg-background-sidebar">
          <label className="text-[11px] font-normal text-[#E4E4E7] m-0 font-inter">
            repeat
          </label>
          <WCFABNumberInput />
        </div>

        {/* amount */}
        <div className="flex flex-col gap-1.5 [&_input]:!bg-background-sidebar [&_input]:!max-w-[154px] [&_input:hover]:!bg-background-sidebar [&_input:focus-visible]:!bg-background-sidebar">
          <label className="text-[11px] font-normal text-[#E4E4E7] m-0 font-inter">
            amount
          </label>
          <WCFABNumberInput />
        </div>
      </div>
    </>
  );
};

export default StaggerPopoverModal;
