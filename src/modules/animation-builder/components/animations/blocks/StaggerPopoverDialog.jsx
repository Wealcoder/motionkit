import React from "react";
import AddPropertyPopover from "@/components/animations/blocks/AddPropertyPopove";
import CodeblockField from "@/components/animations/CodeblockField";
import { Button } from "@/components/ui/button";

const StaggerPopoverDialog = () => {
  return (
    <div className="">
      {/* horizontal line */}
      <div className="w-full h-[1px] bg-[#303033]"></div>

      {/* property add section*/}
      <div className="text-[#E4E4E7] text-[11px] px-[15px] py-3">
        {/* Add properties */}
        <AddPropertyPopover title="Add Snap Properties" />
      </div>

      {/* horizontal line */}
      <div className="w-full h-[1px] bg-[#303033]"></div>

      {/* Output preview */}
      <div className="px-[15px] py-3">
        <div className="flex flex-col gap-2 [&_span]:hidden [&_button]:hidden [&_svg]:hidden [&>div]:gap-0">
          <h3 className="wcf-ab-title !text-[#E4E4E7] m-0">Output Preview</h3>
          <CodeblockField
            property={{ placeholder: "snap: { }", isReadOnly: true }}
          />
        </div>
      </div>

      {/* Footer buttons */}
      <div className="flex items-center gap-2 px-[15px] pb-[15px] pt-2">
        <div asChild>
          <Button className="px-6 py-1 bg-[#303033] text-[11.5px] text-[#FAFAFA] font-normal border-none">
            Cancel
          </Button>
        </div>

        <Button className="px-6 py-1 bg-[#2C76E6] text-[11.5px] text-[#FAFAFA] font-normal border-none">
          Apply
        </Button>
      </div>
    </div>
  );
};

export default StaggerPopoverDialog;
