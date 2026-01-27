import { useState } from "react";
import WCFABDeleteBtn from "@/components/animations/blocks/WCFABDeleteBtn";
import WCFABErrorMessage from "@/components/animations/blocks/WCFABErrorMessage";
import WCFABLabel from "@/components/animations/blocks/WCFABLabel";
import WCFABNumberInput from "./blocks/WCFABNumberInput";

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
    ...rest
  } = property || {};

  const [isDataValid, setIsDataValid] = useState(false);

  return (
    <div>
      <div className={"flex justify-between items-center"}>
        {/* Label + tooltip */}
        <WCFABLabel size={size} title={title} tooltipContent={tooltipContent} />

        {/* Input + delete */}
        <div className={"flex justify-between items-center gap-2"}>
          <WCFABNumberInput
            property={property}
            value={value}
            onValueChange={onValueChange}
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
