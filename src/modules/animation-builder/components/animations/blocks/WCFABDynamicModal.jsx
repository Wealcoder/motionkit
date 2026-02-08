import React from "react";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  CancelCircleIcon,
  Delete01Icon,
  NoteEditIcon,
  Tick02Icon,
} from "@hugeicons/core-free-icons";

const WCFABDynamicModal = ({
  property = {},
  onDisabledUpdate = () => {},
  onValueChange = () => {},
  onClose = () => {},
  onDelete = () => {},
  onAccept = () => {},
  children,
}) => {
  const {
    title = "Draft Animation",
    subtitle = "Your draft animation list",
    count = 12,
    headingIcon = <HugeiconsIcon icon={NoteEditIcon} className="w-6 h-6" />,
    deleteBtn = {
      icon: (
        <HugeiconsIcon
          icon={Delete01Icon}
          strokeWidth="1.2"
          className="w-3.5 h-3.5"
        />
      ),
      label: "Delete",
    },
    publishBtn = {
      icon: (
        <HugeiconsIcon
          icon={Tick02Icon}
          strokeWidth="1.2"
          className="w-3.5 h-3.5"
        />
      ),
      label: "Publish",
    },
    isRequired = false,
    isCustomAnim = true,
    ...rest
  } = property || {};

  return (
    <div className=" flex flex-col gap-6">
      {/* Header*/}
      <div className="flex justify-between">
        <div className="min-w-[202px] max-h-[42px] flex items-center gap-3">
          <div className="w-10 h-10 p-2 rounded-full bg-button-action flex items-center justify-center text-[#FAFAFA]">
            {headingIcon}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <h2 className="text-[13px] font-medium text-[#FAFAFA] leading-5 m-0">
                {title ?? ""}
              </h2>
              <span className="bg-button-action w-6 h-4.5 rounded-[19px] p-1.25 text-white text-[12px] flex items-center justify-center">
                {count ?? 0}
              </span>
            </div>

            <p className="text-[11.5px] font-normal text-foreground-tertiary leading-4.5 m-0">
              {subtitle ?? ""}
            </p>
          </div>
        </div>

        <Button
          onClick={onClose}
          className="border-none cursor-pointer bg-transparent shadow-none"
        >
          <HugeiconsIcon
            icon={CancelCircleIcon}
            className="text-foreground-secondary w-4 h-4"
          />
        </Button>
      </div>

      {/* Dynamic Content */}
      <div className="min-h-[185px] max-h-[205px] overflow-y-auto">{children}</div>

      {/* Footer Buttons */}
      <div className="h-7 flex items-center gap-5">
        <Button
          onClick={onDelete}
          className="bg-button min-w-[174px] max-w-[174px] h-7 rounded-md px-4 py-1 text-[#FAFAFA] border-none cursor-pointer"
        >
          {deleteBtn?.icon}
          <p className="text-xs font-medium leading-5">{deleteBtn?.label}</p>
        </Button>
        <Button
          onClick={onAccept}
          className="bg-button min-w-[174px] max-w-[174px] h-7 rounded-md px-4 py-1 text-[#FAFAFA] border-none cursor-pointer"
        >
          {publishBtn?.icon}
          <p className="text-xs font-medium leading-5">{publishBtn?.label}</p>
        </Button>
      </div>
    </div>
  );
};

export default WCFABDynamicModal;
