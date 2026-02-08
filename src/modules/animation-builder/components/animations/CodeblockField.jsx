import { useCallback, useState } from "react";
import Editor from "react-simple-code-editor";

import Prism from "prismjs";
import "prismjs/components/prism-css";
import "prismjs/components/prism-javascript";
import "prismjs/themes/prism-tomorrow.css";

import WCFABDeleteBtn from "@/components/animations/blocks/WCFABDeleteBtn";
import WCFABErrorMessage from "@/components/animations/blocks/WCFABErrorMessage";
import WCFABLabel from "@/components/animations/blocks/WCFABLabel";

import { debounceFn } from "@/utils/utils";

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
    isReadOnly,
    ...rest
  } = property || {};

  const [code, setCode] = useState(value ?? "");

  const handleChange = useCallback(
    debounceFn((newCode) => {
      setCode(newCode);
      onValueChange(newCode);
    }, 150),
    [],
  );

  const highlightCode = (code) => {
    const grammar =
      language === "css" ? Prism.languages.css : Prism.languages.javascript;
    return Prism.highlight(code, grammar, language);
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Header */}
      <div className="w-full flex items-center justify-between">
        <WCFABLabel title={title} tooltipContent={tooltipContent} />
        {isCustomAnim && <WCFABDeleteBtn onDelete={onDelete} />}
      </div>

      {/* Code Editor */}
      <Editor
        id="sabbir"
        value={code}
        placeholder={placeholder}
        onValueChange={handleChange}
        highlight={highlightCode}
        padding={10}
        spellCheck={false}
        readOnly={isReadOnly}
        className="w-full !min-h-[60px] !max-h-[60px] !overflow-y-auto text-xss leading-4.25 text-foreground bg-input rounded-5"
        textareaId="codeblock-editor"
        textareaClassName="outline-none focus:outline-none focus-visible:outline-none"
      />

      {/* required message */}
      {isRequired && isDataValid && (
        <WCFABErrorMessage message={"This field is required"} />
      )}
    </div>
  );
};

export default CodeblockField;
