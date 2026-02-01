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
import WCFABNumberInput from "./WCFABNumberInput";
import AddPropertyPopover from "./AddPropertyPopove";
import { DialogTitle } from "@/components/ui/dialog";
import CodeblockField from "../CodeblockField";
import { Button } from "@/components/ui/button";

const StaggerPopoverModal = () => {
  return (
    <>
      <div className="flex justify-between items-center">
        <DialogTitle>
          <h2 className="wcf-ab-title">Stagger Settings</h2>
        </DialogTitle>

        <HugeiconsIcon
          icon={CancelCircleIcon}
          size={15}
          className="text-foreground-secondary w-3 h-3"
        />
      </div>
      <div className="flex flex-col gap-2.5 text-[#E4E4E7] text-[11px]">
        {/* each */}
        <AddPropertyPopover title={"Add Stagger Properties"} />

        {/* from */}
        <CodeblockField />

        <Button>Cancel</Button>
        <Button>Apply</Button>
      </div>
    </>
  );
};

export default StaggerPopoverModal;
