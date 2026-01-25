import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import Chrome from "@uiw/react-color-chrome";
import Swatch from "@uiw/react-color-swatch";
import { debounceFn } from "@/utils/utils";
import { hsvaToHexa } from "@uiw/color-convert";

const HEX_REGEX = /^#([0-9A-Fa-f]{3,4}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/;
const STORAGE_KEY = "wcf-ab-swash-colors";
const SWASHLIMIT = 100;

const ColorPicker = ({
  value = "#000000",
  onValueChange = () => {},
  ...rest
}) => {
  const [color, setColor] = useState(value);
  const [inputValue, setInputValue] = useState(value);
  const [swashColors, setSwashColors] = useState([]);

  useEffect(() => {
    setColor(value);
    setInputValue(value);
    handleSwashColors();
  }, [value]);

  const isInvalid = inputValue.length > 0 && !HEX_REGEX.test(inputValue);

  const commitColor = useMemo(
    () =>
      debounceFn((next) => {
        if (!HEX_REGEX.test(next)) return;
        setColor(next);
        onValueChange(next);
      }, 300),
    [onValueChange],
  );

  const handleInputChange = (e) => {
    const next = e.target.value;
    setInputValue(next);
    commitColor(next);
  };

  const handlePickerChange = (pickerColor) => {
    setColor(pickerColor);
    setInputValue(pickerColor);
    onValueChange(pickerColor);
  };

  const handleSwashColors = () => {
    let swashes = [];
    try {
      swashes = JSON.parse(sessionStorage.getItem(STORAGE_KEY)) || [];
    } catch {
      swashes = [];
    }
    if (!swashes.length) return;
    const latestValid = swashes
      .filter((color) => HEX_REGEX.test(color))
      .slice(-SWASHLIMIT);

    setSwashColors(latestValid);
  };

  const handleSaveAsSwash = (color) => {
    if (!color) return;
    let colors = [];
    try {
      colors = JSON.parse(sessionStorage.getItem(STORAGE_KEY)) || [];
    } catch {
      colors = [];
    }
    if (colors.includes(color)) return;
    const nextColors = [...colors, color];
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(nextColors));
  };

  return (
    <div className="flex items-center gap-1.5">
      <Popover
        onOpenChange={(isOpen) => {
          // loading latest swash colors
          if (isOpen) {
            handleSwashColors();
          } else {
            // saving current color as swash
            handleSaveAsSwash(color);
          }
        }}
      >
        <PopoverTrigger
          className="h-[22px] w-[22px] rounded-full border border-neutral-400"
          style={{ backgroundColor: color }}
        />
        <PopoverContent align="end" className="p-2 max-w-[230px]">
          <Chrome
            data-color-mode="dark"
            color={color}
            inputType="hexa"
            onChange={(color) => handlePickerChange(color.hexa)}
          />
          <Swatch
            colors={swashColors}
            color={color}
            inputType="hexa"
            onChange={(hsva) => handlePickerChange(hsvaToHexa(hsva))}
          />
        </PopoverContent>
      </Popover>

      <Input
        value={inputValue}
        onChange={handleInputChange}
        className={`
          wcf-ab-dynamic-field-input
          ${isInvalid ? "border-red-500 focus-visible:ring-red-500" : ""}
        `}
        placeholder="#000000"
      />
    </div>
  );
};

export default ColorPicker;
