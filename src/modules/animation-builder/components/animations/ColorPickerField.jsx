import ToolTipWrapper from "@/components/common/ToolTipWrapper";
import WCFABDeleteBtn from "@/components/animations/blocks/WCFABDeleteBtn";
import WCFABColorPicker from "./blocks/WCFABColorPicker";
import { trimString } from "@/utils/utils";

const ColorPickerField = ({
  property = {},
  value = "#000000",
  onDelete = () => {},
  onDisabledUpdate = () => {},
  onValueChange = () => {},
}) => {
  const {
    title = "Background",
    tooltipContent = "Select your color.",
    isRequired = false,
    isCustomAnim = false,
    ...rest
  } = property || {};

  return (
    <div>
      <div className="flex flex-col justify-between gap-3 rounded-lg sm:flex-row sm:items-center">
        {/* left title + tooltip */}
        <div className="flex items-center gap-[6px]">
          <span className="wcf-ab-title">{trimString(title, 15)}</span>
          {tooltipContent && <ToolTipWrapper text={tooltipContent} />}
        </div>

        <div className="flex items-center gap-2">
          {/* color picker block */}
          <WCFABColorPicker value={value} onValueChange={onValueChange} />
          {isCustomAnim && <WCFABDeleteBtn onDelete={onDelete} />}
        </div>
      </div>
      {/* required message */}
      {isRequired && isDataValid && (
        <p className="text-white text-sm">Field is Required</p>
      )}
    </div>
  );
};

export default ColorPickerField;
