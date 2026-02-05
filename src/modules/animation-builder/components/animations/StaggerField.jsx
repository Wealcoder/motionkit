import React, { useState } from "react";
import WCFABLabel from "@/components/animations/blocks/WCFABLabel";
import WCFABDeleteBtn from "@/components/animations/blocks/WCFABDeleteBtn";
import WCFABErrorMessage from "@/components/animations/blocks/WCFABErrorMessage";
import WCFABNumberInput from "@/components/animations/blocks/WCFABNumberInput";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import StaggerPopoverDialog from "./blocks/StaggerPopoverDialog";
import WCFABSettingBtn from "@/components/animations/blocks/WCFABSettingBtn";

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

          <Dialog>
            <DialogTrigger asChild>
              <WCFABSettingBtn />
            </DialogTrigger>
            <DialogContent className="bg-[#18181B] w-[354px] min-h-[295px] p-0 flex flex-col gap-2.5 [&>button]:hidden">
              <StaggerPopoverDialog />
            </DialogContent>
          </Dialog>

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
