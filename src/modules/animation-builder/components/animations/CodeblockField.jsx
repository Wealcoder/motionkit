import { useState } from "react";
import { Button } from "@/components/ui/button";
import ToolTipWrapper from "@/components/common/ToolTipWrapper";
import Prism from "prismjs";
import Editor from "react-simple-code-editor";

import "prismjs/components/prism-css";
import "prismjs/components/prism-javascript";
import "prismjs/themes/prism-tomorrow.css";

import { Delete01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { debounceFn, trimString } from "@/utils/utils";

const CodeblockField = ({
  property = {},
  value = "",
  onDelete = () => {},
  onDisabledUpdate = () => {},
  onValueChange = () => {},
}) => {
  const {
    title = "Custom",
    tooltipContent = "Enter JS or CSS code",
    placeholder = "x:1, y:2",
    language = "javascript",
    isRequired = false,
    isCustomAnim = true,
    ...rest
  } = property || {};

  const [code, setCode] = useState(value ?? "");

  const handleChange = debounceFn((newCode) => {
    setCode(newCode);
    onValueChange(newCode);
  });

  const highlightCode = (code) => {
    const grammar =
      language === "css" ? Prism.languages.css : Prism.languages.javascript;

    return Prism.highlight(code, grammar, language);
  };

  return (
    <div className="w-64 space-y-3">
      {/* Header */}
      <div className="w-full h-4.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-white text-[11.5px] font-normal leading-4.5">
            {trimString(title, 15)}
          </span>

          {tooltipContent && <ToolTipWrapper text={tooltipContent} />}
        </div>

        {/* delete icon */}
        {property?.isCustomAnim && <DeleteBtn onDelete={onDelete} />}
      </div>

      {/* Code Editor */}
      <div className="rounded-md bg-[#303033] overflow-hidden">
        <Editor
          value={code}
          placeholder={placeholder}
          onValueChange={handleChange}
          highlight={highlightCode}
          padding={10}
          textareaId="codeblock-editor"
          spellCheck={false}
          className="w-full min-h-17.5 text-[11.5px] leading-4.5 text-[#FAFAFA] bg-[#303033]"
        />
      </div>

      {/* required message */}
      {isRequired && !code && (
        <p className="text-red-400 text-xs">Field is Required</p>
      )}
    </div>
  );
};

export default CodeblockField;
