import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";

import {
  CancelCircleIcon,
  Clock03FreeIcons,
} from "@hugeicons/core-free-icons/index";

const historyData = [
  { id: "anim-1", label: "Animation 1 added" },
  { id: "anim-2", label: "Animation 2 added" },
  { id: "anim-3", label: "Animation 3 added" },
  { id: "anim-4", label: "Animation 4 added" },
  { id: "anim-5", label: "Animation 5 added" },
];

const History = ({ onValueChange = () => {}, onClose = () => {} }) => {
  const handleSelect = (item) => {
    console.log(item.id);
    onValueChange(item.id);
  };

  return (
    <Popover>
      {/* Trigger */}
      <PopoverTrigger asChild>
        <Button className={"wcf-ab-button-icon"}>
          <HugeiconsIcon icon={Clock03FreeIcons} size={16} strokeWidth={2} />
        </Button>
      </PopoverTrigger>

      {/* Content */}
      <PopoverContent
        align="start"
        className="min-w-[368px] min-h-[221px] bg-background-topbar rounded-md p-0 mt-5"
      >
        {/* Header */}
        <div className="p-[15px]">
          <div className="flex items-center justify-between">
            <h3 className="text-[13px] font-medium text-white m-0">History</h3>
            <Button className="border-none bg-transparent cursor-pointer w-4 h-4">
              <HugeiconsIcon
                onClick={onClose}
                icon={CancelCircleIcon}
                size={14}
                className="text-foreground-secondary"
              />
            </Button>
          </div>
        </div>

        <div className="w-full h-[1px] bg-button"></div>

        {/* List */}
        <div className="flex flex-col gap-2.5 p-[15px]">
          {historyData.map((item) => (
            <div
              key={item.id}
              onClick={() => handleSelect(item)}
              className="text-[11.5px] font-normal leading-4.5 w-full min-h-5 flex items-center text-[#FAFAFA] cursor-pointer"
            >
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default History;
