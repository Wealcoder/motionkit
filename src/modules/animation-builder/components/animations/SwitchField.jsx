import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import ToolTipWrapper from "@/components/common/ToolTipWrapper";
import DeleteBtn from "@/components/animations/shared/DeleteBtn";

const SwitchField = ({
  property = {
    title: "title",
    tooltipContent: "Enable functionality",
    isRequired: false,
    isCustomAnim: true,
    ...rest,
  },
  value = false,
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
    <div>
      <div className="flex flex-col justify-between gap-3 rounded-lg sm:flex-row sm:items-center">
        {/* left title + tooltip */}
        <div className="flex items-center gap-3 text-[#E4E4E7]">
          <span className="text-white text-15 font-normal leading-5 tracking-normal">
            {property?.title}
          </span>
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
              className="cursor-pointer"
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
