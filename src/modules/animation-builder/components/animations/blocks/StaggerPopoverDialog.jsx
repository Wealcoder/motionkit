import React from "react";
import AddPropertyPopover from "@/components/animations/blocks/AddPropertyPopove";
import CodeblockField from "@/components/animations/CodeblockField";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HugeiconsIcon } from "@hugeicons/react";
import { CancelCircleIcon } from "@hugeicons/core-free-icons/index";

const StaggerPopoverDialog = () => {
  return (
    <div>
      <Tabs>
        {/* Header */}
        <div className="p-2">
          <div className="max-w-[257px] h-[30px] flex items-center justify-between">
            <TabsList className="bg-background-topbar h-[30px]">
              <TabsTrigger
                value="snapSetting"
                className="h-[26px] px-3 py-[3px] text-xs font-normal leading-4.5 data-[state=active]:bg-button data-[state=active]:text-[#FAFAFA] hover:bg-button border-none bg-transparent text-foreground-secondary"
              >
                Snap Settings
              </TabsTrigger>
              <TabsTrigger
                value="custom"
                className="h-[26px] px-3 py-[3px] text-xs font-normal leading-4.5 data-[state=active]:bg-button data-[state=active]:text-[#FAFAFA] hover:bg-button border-none bg-transparent text-foreground-secondary"
              >
                Custom
              </TabsTrigger>
            </TabsList>

            <Button className="bg-transparent border-none text-[#FAFAFA] cursor-pointer">
              <HugeiconsIcon icon={CancelCircleIcon} className="w-4 h-4" />
            </Button>
          </div>
        </div>
        {/* horizontal line */}
        <div className="w-full h-[1px] bg-[#303033]"></div>

        <TabsContent value="snapSetting" className="mt-0">
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
              <h3 className="wcf-ab-title !text-[#E4E4E7] m-0">
                Output Preview
              </h3>
              <CodeblockField
                property={{ placeholder: "snap: { }", isReadOnly: true }}
              />
            </div>
          </div>
        </TabsContent>
        <TabsContent value="custom">
          <div className="px-[15px] py-3 min-h-[135px]">
            <div className="flex flex-col gap-2 [&_span]:hidden [&_button]:hidden [&_svg]:hidden [&>div]:gap-0">
              <h3 className="wcf-ab-title !text-[#E4E4E7] m-0">
                Output Preview
              </h3>
              <CodeblockField
                property={{
                  placeholder: "snap: { }",
                  isReadOnly: false,
                }}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Footer buttons */}
      <div className="flex items-center gap-2 px-[15px]">
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
