import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { HugeiconsIcon } from "@hugeicons/react";
import { Copy01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { copyToClipboard } from "@/utils/copyToClipboard";
import { handleToastEventFromIframe } from "@/lib/editor/core/iframe_events/toasterEvent";
import { handleCloseMenuEvent } from "@/lib/editor/contextMenu/contextMenuEventTrigger";

const ModalInfoInput = ({
  property = {},
  value = "",
  onValueChange = () => {},
}) => {
  const {
    label = "Parent Class",
    placeholder = "Enter Parent Class",
    path = "",
    isRequired = false,
    isCustomAnim = true,
    ...rest
  } = property || {};

  const [inputValue, setInputValue] = useState(value ?? "");

  //   handle copy text
  const handleCopyText = async (textToCopy) => {
    try {
      await copyToClipboard(textToCopy);
      handleToastEventFromIframe({
        type: "success",
        message: `Successfully copied element class`,
      });
    } catch (_) {
      console.warn("Unable to copy element class!");
    } finally {
      handleCloseMenuEvent();
    }
  };

  //   handle input field
  const handleInput = (newValue) => {
    onValueChange(newValue);
  };

  return (
    <div className="w-60 h-[56px] flex flex-col gap-2">
      {/* label */}
      <div className="flex items-center justify-between">
        <h2 className="text-[#FAFAFA] text-xs font-normal leading-5 m-0">
          {label ?? ""}
        </h2>
        {/* copy button */}
        <Button
          onClick={() => handleCopyText(inputValue)}
          className="cursor-pointer bg-button w-5 h-5 p-1 rounded-full flex items-center justify-center border-none [&_svg]:size-3"
          title="Copy"
        >
          <HugeiconsIcon
            icon={Copy01Icon}
            strokeWidth={1}
            className=" text-foreground-tertiary"
          />
        </Button>
      </div>

      {/* Input */}
      <Input
        value={inputValue}
        onChange={(e) => {
          const value = e.target.value;
          setInputValue(value);
          handleInput(value);
        }}
        placeholder={placeholder ?? ""}
        className="bg-button text-[#FAFAFA] !text-[11.5px] font-normal leading-4.5 px-2 py-[5px] w-full max-h-7 placeholder:text-foreground-secondary border-none focus-visible:ring-0"
      />
    </div>
  );
};

export default ModalInfoInput;
