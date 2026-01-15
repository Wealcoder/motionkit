import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ToolTipWrapper from "@/components/common/ToolTipWrapper";
import DeleteBtn from "@/components/animations/shared/DeleteBtn";

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
  const [isValidColorCode, setIsValidColorCode] = useState("");
  const colorInputRef = useRef(null);

  //   validate hex (3 or 6 chars)
  const isValidHex = (value) =>
    /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(value);

  if (!isValid) {
    return setIsValidColorCode(
      "Hex Color Code is not valid. Give a Valid Color Code"
    );
  }

  return (
    <div className="p-2">
      <div className="flex flex-col justify-between gap-3 rounded-lg sm:flex-row sm:items-center">
        {/* left title + tooltip */}
        <div className="flex items-center gap-3 text-[#E4E4E7]">
          <span className="text-white text-15 font-normal leading-5 tracking-normal">
            {title}
          </span>
          {tooltipContent && <ToolTipWrapper text={tooltipContent} />}
        </div>

        {/* right input + delete button */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            {/* Hidden native color picker */}
            <input
              ref={colorInputRef}
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="absolute h-0 w-0 opacity-0"
            />
            {/* Color swatch button */}
            <Button
              type="button"
              size="icon"
              onClick={() => colorInputRef.current?.click()}
              className="h-6 w-6 rounded-full border-2 border-[#3F3F46]"
              style={{ backgroundColor: color }}
            />

            {/* Hex input */}
            <Input
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
              className="w-28 uppercase"
            />
          </div>
          {isCustomAnim && <DeleteBtn onDelete={onDelete} />}
        </div>
      </div>
      {/* required message */}
      <div>
        <p className="text-white text-sm">
          {isRequired && "Field is Required"}
        </p>
        <p>{isValidColorCode}</p>
      </div>
    </div>
  );
};

export default ColorPickerField;
