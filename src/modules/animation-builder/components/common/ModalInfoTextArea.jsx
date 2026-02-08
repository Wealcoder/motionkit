import React, { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { HugeiconsIcon } from "@hugeicons/react";
import { Copy01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { copyToClipboard } from "@/utils/copyToClipboard";
import { handleToastEventFromIframe } from "@/lib/editor/core/iframe_events/toasterEvent";
import { handleCloseMenuEvent } from "@/lib/editor/contextMenu/contextMenuEventTrigger";

const ModalInfoTextArea = ({
  property = {},
  value = "",
  onValueChange = () => {},
}) => {
  const {
    label = "Current Class (Short)",
    placeholder = "Enter Current Class",
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
    <div className="max-w-[492px] min-h-[147px] flex flex-col gap-2">
      {/* label + copy icon*/}
      <div className="flex items-center justify-between">
        <h2 className="text-[#FAFAFA] !text-xs font-normal leading-5 !m-0">
          {label ?? ""}
        </h2>
        {/* copy button */}
        <Button
          onClick={() => handleCopyText(inputValue)}
          className="cursor-pointer bg-button w-5 h-5 p-1.5 rounded-full flex items-center justify-center border-none [&_svg]:size-3"
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
      <Textarea
        value={inputValue}
        onChange={(e) => {
          const value = e.target.value;
          setInputValue(value);
          handleInput(value);
        }}
        placeholder={placeholder ?? "placeholder"}
        className="bg-button text-[#FAFAFA] !text-[11.5px] font-normal leading-4.5 px-3 py-2 w-full min-h-[119px] border-none resize-none focus-visible:ring-0 placeholder:text-foreground-secondary"
      />
    </div>
  );
};

export default ModalInfoTextArea;
