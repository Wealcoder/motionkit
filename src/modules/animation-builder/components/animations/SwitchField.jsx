import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import ToolTipWrapper from "../common/ToolTipWrapper";
import DeleteBtn from "./shared/DeleteBtn";

const SwitchField = ({
  label = "Label",
  tooltipContent = "Enable functionality",
  value = false,
  isRequired = false,
  isCustomAnim = true,
  onUpdateValue = () => {},
  onDisabledUpdate = () => {},
  onDelete = () => {},
}) => {
  const [toggleValue, setToggleValue] = useState(Boolean(value));
  const [isDataValid, setIsDataValid] = useState(false);
  const handleToggle = (checked) => {
    setToggleValue(checked);
    onUpdateValue(checked);
  };
  return (
    <div className="p-2">
      <div className="flex flex-col justify-between gap-3 rounded-lg sm:flex-row sm:items-center">
        {/* left label + tooltip */}
        <div className="flex items-center gap-3 text-[#E4E4E7]">
          <h2 className="text-[#FAFAFA] text-[15px]">{label}</h2>
          {tooltipContent && <ToolTipWrapper text={tooltipContent} />}
        </div>

        {/* right toggle button*/}
        <div className="flex items-center gap-3">
          <div className="flex items-center space-x-2">
            <Switch
              checked={toggleValue}
              onCheckedChange={handleToggle}
              id="airplane-mode"
              className="cursor-pointer"
            />
          </div>

          {/* delete icon */}
          <div>{isCustomAnim && <DeleteBtn onDelete={onDelete} />}</div>
        </div>
      </div>
      {/* required message */}
      <div>
        <p className="text-white text-sm">
          {isRequired && "Field is Required"}
        </p>
      </div>
    </div>
  );
};

export default SwitchField;
