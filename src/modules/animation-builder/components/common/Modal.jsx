import React from "react";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { CancelCircleIcon } from "@hugeicons/core-free-icons";

const Modal = ({
  property = {},
  children,
  onOpenChange=()=>{},
  onCancel = () => {},
  onAccept = () => {},
}) => {
  const { title, subtitle, count, headingIcon, cancelBtn, confirmBtn } =
    property;

  // console.log(title);
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="w-50.5 h-10.5 flex items-center gap-3">
          <div className="w-10 h-10 p-2 rounded-full bg-button-action flex items-center justify-center text-[#FAFAFA]">
            {headingIcon}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <h2 className="text-[13px] font-medium text-[#FAFAFA] leading-5 m-0">
                {title}
              </h2>
              <span className="bg-[#225CB4] w-6 h-[18px] rounded-[19px] p-[5px] text-white text-xs flex items-center justify-center">
                {count}
              </span>
            </div>

            <p className="text-[11.5px] font-normal text-foreground-tertiary leading-4.5 m-0">
              {subtitle}
            </p>
          </div>
        </div>

        {/* Close Button */}
        <Button onClick={() => onOpenChange(false)} className="bg-transparent border-none shadow-none cursor-pointer">
          <HugeiconsIcon
            icon={CancelCircleIcon}
            className="text-[#A1A1AA] w-3.5 h-3.5"
          />
        </Button>
      </div>

      {/* Scrollable Content */}
      <div className="min-h-[185px] max-h-[205px] overflow-y-auto">{children}</div>

      {/* Footer */}
      <div className="flex items-center gap-5">
        <Button
          onClick={onCancel}
          className="bg-button min-w-[174px] h-7 px-4 py-1 rounded-md text-xs font-medium text-[#FAFAFA] border-none cursor-pointer"
        >
          {cancelBtn.icon}
          {cancelBtn.label}
        </Button>

        <Button
          onClick={onAccept}
          className="bg-button min-w-[174px] h-7 px-4 py-1 rounded-md text-xs font-medium text-[#FAFAFA] border-none cursor-pointer"
        >
          {confirmBtn.icon}
          {confirmBtn.label}
        </Button>
      </div>
    </div>
  );
};

export default Modal;
