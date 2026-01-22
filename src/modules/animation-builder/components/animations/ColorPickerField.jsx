import { useRef, useState } from "react";
import { Input } from "@/components/ui/input";

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

  const [color, setColor] = useState(value || "#FFFFFF");
  const [isValidColorCode, setIsValidColorCode] = useState(true);
  const colorInputRef = useRef(null);

  //   validate hex (3 or 6 chars)
  const isValidHex = (value) =>
    /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(value);

  if (!isValidColorCode) {
    return setIsValidColorCode(
      "Hex Color Code is not valid. Give a Valid Color Code",
    );
  }

  return (
    <div>
      <div className="flex flex-col justify-between gap-3 rounded-lg sm:flex-row sm:items-center">
        {/* left title + tooltip */}
        <div className="flex items-center gap-[6px]">
          <span className="wcf-ab-title">{title}</span>
          {tooltipContent && <ToolTipWrapper text={tooltipContent} />}
        </div>

        {/* right input + delete button */}
        <div className="flex items-center gap-2">
          <ColorPicker />
          <div className="relative flex items-center gap-2">
            {/* Hex input */}
            {/* <Input
              value={color}
              onChange={(e) => {
                const value = e.target.value;
                setColor(value);
              }}
              onBlur={() => {
                if (!isValidHex(color)) {
                  setColor(config.defaultValue);
                }
              }}
              placeholder="Add Value"
              className="wcf-ab-dynamic-field-input"
            /> */}
          </div>
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
