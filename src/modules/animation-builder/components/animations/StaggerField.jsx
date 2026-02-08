import React, { useState } from "react";
import WCFABLabel from "@/components/animations/blocks/WCFABLabel";
import WCFABDeleteBtn from "@/components/animations/blocks/WCFABDeleteBtn";
import WCFABErrorMessage from "@/components/animations/blocks/WCFABErrorMessage";
import WCFABNumberInput from "@/components/animations/blocks/WCFABNumberInput";
import StaggerPopoverDialog from "@/components/animations/blocks/StaggerPopoverDialog";
import WCFABSettingBtn from "@/components/animations/blocks/WCFABSettingBtn";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CodeblockField from "./CodeblockField";
import { Button } from "../ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { CancelCircleIcon } from "@hugeicons/core-free-icons/index";

const StaggerField = ({
  property = {},
  value,
  onValueChange = () => {},
  onDisabledUpdate = () => {},
  onDelete = () => {},
}) => {
  // default value
  const {
    title = "title",
    tooltipContent = "Enter the value.",
    isRequired = false,
    isCustomAnim = true,
    min = 0,
    max = 0,
    path = "",
    ...rest
  } = property || {};

  const [isDataValid, setIsDataValid] = useState(false);

  return (
    <div>
      <div className="w-full flex justify-between items-center">
        <WCFABLabel title={title} tooltipContent={tooltipContent} />

        <div className="flex items-center gap-2">
          <WCFABNumberInput property={property} />

          <Popover>
            <PopoverTrigger asChild>
              <WCFABSettingBtn />
            </PopoverTrigger>
            <PopoverContent
              align="end"
              className="bg-[#18181B] w-[287px] min-h-[295px] p-0"
            >
              <Tabs>
                {/* Header */}
                <div className="px-[15px] py-3">
                  <div className="h-5 flex items-center justify-between">
                    <TabsList className="bg-background-topbar">
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
                      <HugeiconsIcon
                        icon={CancelCircleIcon}
                        className="w-4 h-4"
                      />
                    </Button>
                  </div>
                </div>

                <TabsContent value="snapSetting">
                  <StaggerPopoverDialog />
                </TabsContent>
                <TabsContent value="custom">
                  <div className="px-[15px] py-3">
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
            </PopoverContent>
          </Popover>

          {/* delete button */}
          {isCustomAnim && <WCFABDeleteBtn onDelete={onDelete} />}
        </div>
      </div>
      {/* required message */}
      {isRequired && isDataValid && (
        <WCFABErrorMessage message={"This field is required"} />
      )}
    </div>
  );
};

export default StaggerField;
