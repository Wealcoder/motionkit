import { useState } from "react";
import WCFABDeleteBtn from "@/components/animations/blocks/WCFABDeleteBtn";
import WCFABErrorMessage from "@/components/animations/blocks/WCFABErrorMessage";
import WCFABLabel from "@/components/animations/blocks/WCFABLabel";
import WCFABCssInput from "@/components/animations/blocks/WCFABCssInput";

const WidthHeightField = ({
  property = {},
  value = "",
  onValueChange = () => {},
  onDisabledUpdate = () => {},
  onDelete = () => {},
}) => {
  const {
    title = "title",
    tooltipContent = "MinWidth Value",
    min = 0,
    max = 0,
    isRequired = false,
    isCustomAnim = true,
    ...rest
  } = property || {};
  
  // console.log("coming value", value);

  const [isDataValid, setIsDataValid] = useState(false);

  return (
    <div className="w-full">
      <div className="w-full flex justify-between items-center">
        {/* left title + tooltip */}
        <WCFABLabel title={title} tooltipContent={tooltipContent} />

        {/* right input + delete button */}
        <div className="flex items-center gap-3 w-37.5 h-7">
          {/* input group (input field + unit selector) */}
          <WCFABCssInput
            property={property}
            value={value}
            onValueChange={onValueChange}
          />
          {/* delete button */}
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

export default WidthHeightField;
