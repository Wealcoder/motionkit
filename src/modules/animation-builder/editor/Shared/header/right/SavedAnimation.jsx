import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { Bookmark02Icon } from "@hugeicons/core-free-icons";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import Modal from "@/components/common/Modal";
import { Delete01Icon, Tick02Icon } from "@hugeicons/core-free-icons/index";

const SavedAnimation = () => {
  return (
    <Popover>
      {/* Trigger */}
      <PopoverTrigger asChild>
        <Button className={"wcf-ab-button-icon"}>
          <HugeiconsIcon icon={Bookmark02Icon} size={16} strokeWidth={2} />
        </Button>
      </PopoverTrigger>

      {/* Content */}
      <PopoverContent
        align="center"
        className="min-w-[398px] min-h-[333px] rounded-md bg-background-topbar p-[15px] mt-[18px]"
      >
        <Modal
          property={{
            title: "Saved Animation",
            subtitle: "Your saved animation list",
            count: 12,
            headingIcon: (
              <HugeiconsIcon icon={Bookmark02Icon} size={16} strokeWidth={2} />
            ),
            cancelBtn: {
              icon: <HugeiconsIcon icon={Delete01Icon} className="w-4 h-4" />,
              label: "Cancel",
            },
            confirmBtn: {
              icon: <HugeiconsIcon icon={Tick02Icon} className="w-4 h-4" />,
              label: "Confirm",
            },
          }}
        />
      </PopoverContent>
    </Popover>
  );
};

export default SavedAnimation;
