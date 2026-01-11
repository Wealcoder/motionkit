import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

export default function ColorPickerField({
  label = "Background",
  tooltipContent = "Select your color.",
  value = "#000000",
  config = { defaultValue: "#000000" },
  isRequired = false,
  isValid = () => {},
  onDelete,
  isCustomAnim = true,
}) {
  const [color, setColor] = useState(value || config.defaultValue || "#FFFFFF");
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
        {/* left label + tooltip */}
        <div className="flex items-center gap-3 text-[#E4E4E7]">
          <h2 className="text-white text-sm">{label}</h2>
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
        <p>{isValidColorCode}</p>
      </div>
    </div>
  );
}
