import React, { useState } from "react";
import WCFABDeleteBtn from "@/components/animations/blocks/WCFABDeleteBtn";
import WCFABLabel from "@/components/animations/blocks/WCFABLabel";
import WCFABSelect from "@/components/animations/blocks/WCFABSelect";
import WCFABErrorMessage from "@/components/animations/blocks/WCFABErrorMessage";

const SelectField = ({
  property = {},
  value = "",
  onDelete = () => {},
  onDisabledUpdate = () => {},
  onValueChange = () => {},
}) => {
  const {
    size = "custom",
    title = "Label",
    tooltipContent = "Select Method",
    isRequired = false,
    isCustomAnim = false,
    placeholder = "Select Value",
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
          <WCFABSelect
            property={property}
            value={value}
            onValueChange={onValueChange}
          />
          {isCustomAnim && <WCFABDeleteBtn onDelete={onDelete} />}
        </div>
      </div>

      {/* Required message */}
      {isRequired && isDataValid && (
        <WCFABErrorMessage message={"This field is required"} />
      )}
    </div>
  );
};
export default SelectField;
