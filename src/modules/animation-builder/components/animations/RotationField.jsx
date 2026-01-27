import { useState } from "react";
import WCFABDeleteBtn from "@/components/animations/blocks/WCFABDeleteBtn";
import WCFABLabel from "@/components/animations/blocks/WCFABLabel";
import WCFABRotationPicker from "@/components/animations/blocks/WCFABRotationPicker";
import WCFABErrorMessage from "@/components/animations/blocks/WCFABErrorMessage";

const RotationField = ({
  property = {},
  value = 0,
  onDelete = () => {},
  onDisabledUpdate = () => {},
  onValueChange = () => {},
}) => {
  const {
    title = "Rotate",
    tooltipContent = "Adjust Rotate Value",
    isRequired = false,
    isCustomAnim = false,
    ...rest
  } = property || {};

  const [isDataValid, setIsDataValid] = useState(false);

  return (
    <div>
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        {/* title */}
        <WCFABLabel title={title} tooltipContent={tooltipContent} />

        {/* controls */}
        <div className="flex-1 flex justify-end items-center gap-2">
          <WCFABRotationPicker
            value={value}
            property={property}
            onValueChange={onValueChange}
          />
          {isCustomAnim && <WCFABDeleteBtn onDelete={onDelete} />}
        </div>
      </div>

      {isRequired && isDataValid && (
        <WCFABErrorMessage message={"This field is required"} />
      )}
    </div>
  );
};

export default RotationField;
