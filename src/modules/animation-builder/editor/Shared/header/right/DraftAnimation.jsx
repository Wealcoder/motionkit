import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Delete01Icon,
  LicenseDraftIcon,
  NoteEditIcon,
  Upload01Icon,
} from "@hugeicons/core-free-icons/index";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import Modal from "@/components/common/Modal";
import DraftAnimationContent from "@/components/common/DraftAnimationContent";

const DraftAnimation = () => {
  return (
    <Popover>
      {/* Trigger */}
      <PopoverTrigger asChild>
        <Button className={"wcf-ab-button-icon"}>
          <HugeiconsIcon icon={LicenseDraftIcon} size={16} strokeWidth={2} />
        </Button>
      </PopoverTrigger>

      {/* Content */}
      <PopoverContent
        align="end"
        className="min-w-[398px] min-h-[333px] rounded-md bg-background-topbar p-[15px] mt-[18px]"
      >
        <Modal
          property={{
            title: "Draft Animation",
            subtitle: "Your draft animation list",
            count: 12,
            headingIcon: (
              <HugeiconsIcon icon={NoteEditIcon} className="w-6 h-6" />
            ),
            cancelBtn: {
              icon: <HugeiconsIcon icon={Delete01Icon} strokeWidth={1} color="#FAFAFA" className="w-4 h-4" />,
              label: "Delete",
            },
            confirmBtn: {
              icon: <HugeiconsIcon icon={Upload01Icon} strokeWidth={1} color="#FAFAFA" className="w-4 h-4" />,
              label: "Publish",
            },
          }}
        >
          <DraftAnimationContent />
        </Modal>
      </PopoverContent>
    </Popover>
  );
};

export default DraftAnimation;
