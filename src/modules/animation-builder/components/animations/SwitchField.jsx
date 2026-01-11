import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Delete01Icon,
  InformationCircleIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

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
          <Tooltip>
            <TooltipTrigger asChild>
              <button>
                <HugeiconsIcon
                  icon={InformationCircleIcon}
                  className="w-2.5 h-2.5"
                />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{tooltipContent}</p>
            </TooltipContent>
          </Tooltip>
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
          {isCustomAnim && (
            <Button>
              <HugeiconsIcon
                icon={Delete01Icon}
                onClick={onDelete}
                className="text-[#A1A1AA]"
              />
            </Button>
          )}
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
