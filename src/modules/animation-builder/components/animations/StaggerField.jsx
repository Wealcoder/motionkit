import React, { useState } from "react";
import WCFABLabel from "@/components/animations/blocks/WCFABLabel";
import WCFABDeleteBtn from "@/components/animations/blocks/WCFABDeleteBtn";
import WCFABErrorMessage from "@/components/animations/blocks/WCFABErrorMessage";
import WCFABNumberInput from "@/components/animations/blocks/WCFABNumberInput";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@/components/ui/button";
import { Settings03Icon } from "@hugeicons/core-free-icons/index";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import StaggerPopoverDialog from "./blocks/StaggerPopoverDialog";


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
          <WCFABNumberInput
            property={property}
          />

          <Dialog>
            <DialogTrigger asChild>
              <Button className="wcf-ab-button-icon">
                <HugeiconsIcon
                  icon={Settings03Icon}
                  color="#A1A1AA"
                  strokeWidth={1.5}
                  className="w-3.5 h-3.5 text-white"
                />
              </Button>
            </DialogTrigger>
            <DialogContent
              className="bg-[#18181B] w-[354px] min-h-[295px] p-0 flex flex-col gap-2.5 [&>button]:hidden"
            >
              <StaggerPopoverDialog/>
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
