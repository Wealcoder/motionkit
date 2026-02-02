import React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { CancelCircleIcon } from "@hugeicons/core-free-icons";
import AddPropertyPopover from "./AddPropertyPopove";
import CodeblockField from "../CodeblockField";
import { Button } from "@/components/ui/button";
import { DialogTitle, DialogClose } from "@/components/ui/dialog";

const staggerProperties=[]

const StaggerPopoverDialog = () => {
  return (
    <div className="">
      {/* Header */}
      <div className="px-[15px] py-3">
        <div className="w-[324px] h-5 flex items-center justify-between">
          <DialogTitle
            asChild
            className="text-white text-[13px] font-medium leading-5"
          >
            <h2 className="m-0">Stagger Settings</h2>
          </DialogTitle>

          <DialogClose asChild className="ring-0 focus:ring-0">
            <Button className="bg-transparent border-none text-[#FAFAFA] cursor-pointer">
              <HugeiconsIcon icon={CancelCircleIcon} className="w-4 h-4" />
            </Button>
          </DialogClose>
        </div>
      </div>

      {/* horizontal line */}
      <div className="w-full h-[1px] bg-[#303033]"></div>

      {/* property add section*/}
      <div className="text-[#E4E4E7] text-[11px] px-[15px] py-3">
        {/* Add properties */}
        <AddPropertyPopover title="Add Stagger Properties" />
      </div>

      {/* horizontal line */}
      <div className="w-full h-[1px] bg-[#303033]"></div>

      {/* Output preview */}
      <div className="px-[15px] py-3">
        <div className="flex flex-col gap-2 [&_span]:hidden [&_button]:hidden [&_svg]:hidden [&>div]:gap-0">
          <h3 className="wcf-ab-title !text-[#E4E4E7] m-0">Output Preview</h3>
          <CodeblockField />
        </div>
      </div>

      {/* Footer buttons */}
      <div className="flex items-center gap-2 px-[15px] pb-[15px] pt-2">
        <DialogClose asChild>
          <Button className="px-6 py-1 bg-[#303033] text-[11.5px] text-[#FAFAFA] font-normal border-none">
            Cancel
          </Button>
        </DialogClose>

        <Button className="px-6 py-1 bg-[#2C76E6] text-[11.5px] text-[#FAFAFA] font-normal border-none">
          Apply
        </Button>
      </div>
    </div>
  );
};

export default StaggerPopoverDialog;
