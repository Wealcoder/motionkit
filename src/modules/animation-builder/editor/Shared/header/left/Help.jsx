import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { InformationCircleIcon } from "@hugeicons/core-free-icons";
import { BubbleChatQuestionIcon, CustomerSupportIcon, DocumentAttachmentIcon, KeyboardIcon } from "@hugeicons/core-free-icons/index";

const helpData = [
  {
    id: "1",
    icon: (
      <HugeiconsIcon
        icon={DocumentAttachmentIcon}
        size={14}
        color="currentColor"
        strokeWidth={1}
        className="text-[#E4E4E7]"
      />
    ),
    label: "Documentation",
  },
  {
    id: "2",
    icon: (
      <HugeiconsIcon
        icon={KeyboardIcon}
        size={14}
        color="currentColor"
        strokeWidth={1}
        className="text-[#E4E4E7]"
      />
    ),
    label: "Keyboard Shortcuts",
  },
  {
    id: "3",
    icon: (
      <HugeiconsIcon
      icon={CustomerSupportIcon}
      size={14}
      color="currentColor"
      strokeWidth={1}
      className="text-[#E4E4E7]"
    />
    ),
    label: "Support & Contact",
  },
  {
    id: "4",
    icon: (
      <HugeiconsIcon
      icon={BubbleChatQuestionIcon}
      size={14}
      color="currentColor"
      strokeWidth={1}
      className="text-[#E4E4E7]"
    />
    ),
    label: "FAQ",
  },
];

const Help = () => {
  return (
    <Popover>
      {/* Trigger */}
      <PopoverTrigger asChild>
        <Button className={"wcf-ab-button-icon"}>
          <HugeiconsIcon
            icon={InformationCircleIcon}
            size={16}
            strokeWidth={2}
          />
        </Button>
      </PopoverTrigger>

      {/* Content */}
      <PopoverContent
        align="start"
        className="max-w-[185px] min-h-[135px] bg-background-topbar rounded-md p-0 mt-5"
      >
        <div className="flex flex-col gap-1 p-1">
          {helpData.map((item) => (
            <div
              key={item.id}
              className="w-full min-h-7 flex items-center gap-1.5 text-[#FAFAFA] cursor-pointer hover:bg-button px-2 rounded-5"
            >
              {item.icon}
              <label className="text-[13px] font-normal leading-5 cursor-pointer">{item.label}</label>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default Help;
