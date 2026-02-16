import { useState } from "react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  InformationCircleIcon,
  BubbleChatQuestionIcon,
  CustomerSupportIcon,
  DocumentAttachmentIcon,
  KeyboardIcon,
} from "@hugeicons/core-free-icons";
import KeyboardShortcutModal from "@/components/common/KeyboardShortcutModal";
import FAQModal from "@/components/common/FAQModal";

const helpData = [
  {
    id: "docs",
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
    id: "shortcuts",
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
    id: "support",
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
    id: "faq",
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
  const [activeModal, setActiveModal] = useState(null);

  const openModal = (type) => {
    setActiveModal(type);
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  return (
    <>
      {/* Popover */}
      <Popover>
        <PopoverTrigger asChild>
          <Button className="wcf-ab-button-icon">
            <HugeiconsIcon
              icon={InformationCircleIcon}
              size={16}
              strokeWidth={2}
            />
          </Button>
        </PopoverTrigger>

        <PopoverContent
          align="start"
          className="max-w-[185px] bg-background-topbar rounded-md p-1 mt-5"
        >
          <div className="flex flex-col gap-1">
            {helpData.map((item) => (
              <div
                key={item.id}
                onClick={() => openModal(item.id)}
                className="w-full min-h-7 flex items-center gap-2 text-[#FAFAFA] cursor-pointer hover:bg-button px-2 rounded-5 transition-colors"
              >
                {item.icon}
                <span className="text-[13px] leading-5">{item.label}</span>
              </div>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      <KeyboardShortcutModal
        open={activeModal === "shortcuts"}
        onClose={closeModal}
      />
      <FAQModal open={activeModal === "faq"} onClose={closeModal} />
    </>
  );
};

export default Help;
