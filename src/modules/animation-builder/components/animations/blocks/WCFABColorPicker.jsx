import { useCallback, useEffect, useMemo, useState } from "react";
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

const STORAGE_KEY = "wcf-ab-swash-colors";
const SWASHLIMIT = 100;

// Do not modify these
const HEXA_REGEX = /^#([0-9A-Fa-f]{3,4}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/;
const RGB_REGEX = /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/;
const RGBA_REGEX =
  /^rgba\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(0|1|0?\.\d+)\s*\)$/;
const HSL_REGEX = /^hsl\(\s*(\d{1,3})\s*,\s*(\d{1,3})%\s*,\s*(\d{1,3})%\s*\)$/;
const HSLA_REGEX =
  /^hsla\(\s*(\d{1,3})\s*,\s*(\d{1,3})%\s*,\s*(\d{1,3})%\s*,\s*(0|1|0?\.\d+)\s*\)$/;

function inRange(value, min, max) {
  return value >= min && value <= max;
}
function validateRGB(values) {
  return values.every((v) => inRange(v, 0, 255));
}
function validateHSL(h, s, l) {
  return inRange(h, 0, 360) && inRange(s, 0, 100) && inRange(l, 0, 100);
}

const WCFABColorPicker = ({
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

  const isInvalid = inputValue.length > 0 && !HEXA_REGEX.test(inputValue);

  const commitColor = useCallback(
    debounceFn((next) => {
      setColor(next);
      onValueChange(next);
    }, 150),
    [onValueChange],
  );

  const validateColor = useCallback((value) => {
    if (!value) return false;
    if (HEXA_REGEX.test(value)) return true;
    let match = value.match(RGB_REGEX);
    if (match) {
      return validateRGB(match.slice(1).map(Number));
    }
    match = value.match(RGBA_REGEX);
    if (match) {
      const [r, g, b, a] = match.slice(1).map(Number);
      return validateRGB([r, g, b]) && inRange(a, 0, 1);
    }
    match = value.match(HSL_REGEX);
    if (match) {
      const [h, s, l] = match.slice(1).map(Number);
      return validateHSL(h, s, l);
    }
    match = value.match(HSLA_REGEX);
    if (match) {
      const [h, s, l, a] = match.slice(1).map(Number);
      return validateHSL(h, s, l) && inRange(a, 0, 1);
    }
    return false;
  }, []);

  const handleInputChange = (e) => {
    const next = e.target.value;
    setInputValue(next);
    const isValid = validateColor(next);
    if (validateColor(next)) {
      commitColor(next);
    }
  };

  const handlePickerChange = useCallback((pickerColor) => {
    if (!validateColor(pickerColor)) return;
    setColor(pickerColor);
    setInputValue(pickerColor);
    onValueChange(pickerColor);
  }, []);

  const handleSwashColors = useCallback(() => {
    let swashes = [];
    try {
      swashes = JSON.parse(sessionStorage.getItem(STORAGE_KEY)) || [];
    } catch {
      swashes = [];
    }
    if (!swashes.length) return;
    const latestValid = swashes
      .filter((color) => HEXA_REGEX.test(color))
      .slice(-SWASHLIMIT);

    setSwashColors(latestValid);
  }, []);

  const handleSaveAsSwash = useCallback((color) => {
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
  }, []);

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
          className="h-[21px] w-[21px] p-0 m-0 hover:scale-105 rounded-full border-2 border-solid border-button cursor-pointer"
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
          wcf-ab-text-input
          ${isInvalid ? "border-red-500 focus-visible:ring-red-500" : ""}
        `}
        placeholder="#000000"
      />
    </div>
  );
};

export default WCFABColorPicker;
