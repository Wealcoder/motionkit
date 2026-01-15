import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { HugeiconsIcon } from "@hugeicons/react";
import { CancelCircleIcon } from "@hugeicons/core-free-icons";

const Modal = ({
  property = {
    title: "Draft Animation",
    subtitle: "Your draft animation list",
    count: 12,
    headingIcon: null,
    cancelBtn: {
      icon: null,
      label: "Cancel",
    },
    confirmBtn: {
      icon: null,
      label: "Confirm",
    },
  },
  children,
  isOpen,
  onOpenChange,
  onCancel = () => {},
  onAccept = () => {},
}) => {
  const { title, subtitle, count, headingIcon, cancelBtn, confirmBtn } =
    property;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-99.5 max-h-97.5 rounded-md bg-[#27272A] p-3.75 flex flex-col gap-7.5">
        {/* Header */}
        <DialogHeader className="flex items-start justify-between">
          <div className="w-50.5 h-10.5 flex items-center gap-3">
            <div className="w-10 h-10 p-2 rounded-full bg-[#64964C] flex items-center justify-center text-[#FAFAFA]">
              {headingIcon}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <DialogTitle className="text-[15px] font-medium text-[#FAFAFA] leading-5">
                  {title}
                </DialogTitle>
                <span className="bg-[#64964C] w-6 h-4.5 rounded-2xl p-1.25 text-white font-[12px] flex items-center justify-center">
                  {count}
                </span>
              </div>

              <DialogDescription className="text-sm font-normal text-[#E4E4E7] leading-4.5">
                {subtitle}
              </DialogDescription>
            </div>
          </div>

          <button onClick={() => onOpenChange(false)}>
            <HugeiconsIcon
              icon={CancelCircleIcon}
              className="text-[#E55F42] w-4 h-4"
            />
          </button>
        </DialogHeader>

        {/* Dynamic Content */}
        <div className="max-h-55.5 overflow-y-auto">{children}</div>

        {/* Footer Buttons */}
        <DialogFooter className="w-92 h-9 flex items-center gap-5 pt-2">
          <Button
            onClick={onCancel}
            className="bg-[#3F3F46] w-43.5 h-9 rounded-md text-[15px] font-medium text-[#FAFAFA] leading-5"
          >
            {cancelBtn.icon}
            {cancelBtn.label}
          </Button>
          <Button
            onClick={onAccept}
            className="bg-[#3F3F46] w-43.5 h-9 rounded-md text-[15px] font-medium text-[#FAFAFA] leading-5"
          >
            {confirmBtn.icon}
            {confirmBtn.label}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default Modal;
