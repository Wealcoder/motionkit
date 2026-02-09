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
import {
  CancelCircleIcon,
  Target03Icon,
} from "@hugeicons/core-free-icons/index";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";

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
      // console.log(newCode)
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

        <div className="flex items-center gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-transparent border-none outline-none shadow-none cursor-pointer">
                <HugeiconsIcon
                  icon={Target03Icon}
                  size={12}
                  strokeWidth={2}
                  color="#fafafa"
                />
              </Button>
            </DialogTrigger>
            <DialogContent className="!p-2 bg-[#18181b] min-w-[750px] h-[420px] flex flex-col [&>button.absolute]:hidden !gap-0">
              {/* Header */}
              <div className="flex justify-end">
                <DialogClose asChild>
                  <Button className="p-1 rounded bg-transparent border-none w-4 h-4 cursor-pointer">
                    <HugeiconsIcon
                      icon={CancelCircleIcon}
                      className="text-[#A1A1AA]"
                    />
                  </Button>
                </DialogClose>
              </div>

              {/* Code Editor */}
              <div className="flex-1 overflow-hidden">
                <Editor
                  id="sabbir"
                  value={code}
                  placeholder={placeholder}
                  onValueChange={handleChange}
                  highlight={highlightCode}
                  padding={10}
                  spellCheck={false}
                  readOnly={isReadOnly}
                  className="w-full h-full !overflow-y-auto text-xss leading-[17px] text-foreground"
                  textareaId="codeblock-editor"
                  textareaClassName="outline-none focus:outline-none focus-visible:outline-none"
                />
              </div>
            </DialogContent>
          </Dialog>

          {/* delete button */}
          {isCustomAnim && <WCFABDeleteBtn onDelete={onDelete} />}
        </div>
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
        className="w-full !min-h-[60px] !max-h-[60px] !overflow-y-auto text-xss leading-[17px] text-foreground bg-input rounded-5"
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
