import ToolTipWrapper from "@/components/common/ToolTipWrapper";
import DeleteBtn from "@/components/animations/shared/DeleteBtn";
import ColorPicker from "./shared/ColorPicker";

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
          <span className="wcf-ab-title">{title}</span>
          {tooltipContent && <ToolTipWrapper text={tooltipContent} />}
        </div>

        <div className="flex items-center gap-2">
          {/* color picker block */}
          <ColorPicker value={value} onValueChange={onValueChange} />
          {isCustomAnim && <DeleteBtn onDelete={onDelete} />}
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
