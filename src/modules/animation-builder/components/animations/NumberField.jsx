import { useState } from "react";
import WCFABDeleteBtn from "@/components/animations/blocks/WCFABDeleteBtn";
import WCFABLabel from "@/components/animations/blocks/WCFABLabel";
import WCFABInput from "@/components/animations/blocks/WCFABInput";
import WCFABErrorMessage from "@/components/animations/blocks/WCFABErrorMessage";
import { contentWrapper } from "@/components/animations/shared/style";
import { cn } from "@/lib/utils";

const NumberField = ({
  property = {},
  value = 0,
  onDelete = () => {},
  onDisabledUpdate = () => {},
  onValueChange = () => {},
}) => {
  // default value
  const {
    size = "sm",
    title = "title",
    tooltipContent = "Enter the value.",
    isRequired = false,
    isCustomAnim = false,
    placeholder = "Add Value",
    min = 0,
    max = 0,
    path = "",
    ...rest
  } = property || {};

  const [isDataValid, setIsDataValid] = useState(false);

  return (
    <div>
      <div className={"flex justify-between items-center"}>
        {/* Label + tooltip */}
        <WCFABLabel size={size} title={title} tooltipContent={tooltipContent} />

        {/* Input + delete */}
        <div className={cn(contentWrapper({ size }))}>
          <WCFABInput
            size={size}
            type="number"
            placeholder={placeholder}
            value={value}
            onValueChange={onValueChange}
            min={min}
            max={max}
          />
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

export default NumberField;
