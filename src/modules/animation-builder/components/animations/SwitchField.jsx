import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import ToolTipWrapper from "@/components/common/ToolTipWrapper";
import DeleteBtn from "@/components/animations/shared/DeleteBtn";
import { trimString } from "@/utils/utils";

const SwitchField = ({
  property = {},
  value = false,
  onValueChange = () => {},
  onDisabledUpdate = () => {},
  onDelete = () => {},
}) => {
  const {
    title = "title",
    tooltipContent = "Enable functionality",
    isRequired = false,
    isCustomAnim = false,
    ...rest
  } = property || {};

  const [toggleValue, setToggleValue] = useState(Boolean(value));
  const [isDataValid, setIsDataValid] = useState(false);
  const handleToggle = (checked) => {
    setToggleValue(checked);
    onValueChange(checked);
  };
  return (
    <div>
      <div className="flex flex-col justify-between gap-3 rounded-lg sm:flex-row sm:items-center">
        {/* left title + tooltip */}
        <div className="flex items-center gap-[6px]">
          <span className="wcf-ab-title">{trimString(title, 15)}</span>
          {property?.tooltipContent && (
            <ToolTipWrapper text={property?.tooltipContent} />
          )}
        </div>

        {/* right toggle button*/}
        <div className="flex-1 flex justify-end items-center gap-3">
          <div className="flex items-center space-x-2">
            <Switch
              checked={toggleValue}
              onCheckedChange={handleToggle}
              id="airplane-mode"
              className="wcf-ab-switch-field"
            />
          </div>

          {/* delete icon */}
          {property?.isCustomAnim && <DeleteBtn onDelete={onDelete} />}
        </div>
      </div>
      {/* required message */}
      {property?.isRequired && isDataValid && (
        <p className="text-white text-sm">Field is Required</p>
      )}
    </div>
  );
};

export default SwitchField;
