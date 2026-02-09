import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import WCFABDeleteBtn from "@/components/animations/blocks/WCFABDeleteBtn";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const drafts = [
  { id: 1, title: "Animation 1", time: "11 pm 01 Nov 25" },
  { id: 2, title: "Animation 2", time: "11 pm 01 Nov 25" },
  { id: 3, title: "Animation 3", time: "11 pm 01 Nov 25" },
  { id: 4, title: "Animation 4", time: "11 pm 01 Nov 25" },
  { id: 5, title: "Animation 5", time: "11 pm 01 Nov 25" },
];

const selectItem = [
  { id: 1, value: "all", label: "All" },
  { id: 2, value: "date", label: "Date" },
  { id: 3, value: "name", label: "Name" },
  { id: 4, value: "latest", label: "Latest" },
];

const DraftAnimationContent = () => {
  return (
    <div className="flex flex-col gap-[15px] text-[13px]">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-1.5">
          <Checkbox className="p-0 w-3 h-3" />
          <label className="text-[#FAFAFA] text-[11.5px] font-normal leading-4.5">
            Select All
          </label>
        </div>
        <div>
          <Select>
            <SelectTrigger className="bg-button min-w-[81px] max-h-[30px] text-[#FAFAFA] border-none text-[11.5px] font-normal leading-4.5">
              <SelectValue placeholder="All" className="" />
            </SelectTrigger>
            <SelectContent
              align="end"
              className="bg-button flex flex-col gap-2 text-[#FAFAFA] min-w-[81px] max-w-[81px] max-h-[112px] [&_svg]:hidden"
            >
              {selectItem.map((item) => (
                <SelectItem
                  key={item.id}
                  value={item.value}
                  className="text-[11.5px] font-normal leading-4.5 cursor-pointer hover:bg-select-hover data-[highlighted]:bg-select-hover data-[state=checked]:bg-select-hover"
                >
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        {drafts.map((item) => (
          <div
            key={item.id}
            className="flex justify-between items-center overflow-hidden"
          >
            <div className="flex items-center gap-1.5">
              <Checkbox className="p-0 w-3 h-3" />
              <label className="text-[#FAFAFA] text-[11.5px] font-normal leading-4.5">
                {item.title}
              </label>
            </div>
            <div className="flex items-center gap-[15px]">
              <span className="text-[#A1A1AA] text-[11.5px] font-normal leading-4.5">
                {item.time}
              </span>
              <div className="[&_svg]:!w-2.5 [&_svg]:!h-2.5 [&>button]:w-5 [&>button]:h-5 [&>button]:bg-[#303033] [&>button]:rounded-full">
                <WCFABDeleteBtn />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DraftAnimationContent;
