import { cssUnits } from "@/config/dynamicPropertiesData";

// Parse a CSS value string into { value, unit }
const ALLOWED_UNITS = new Set(cssUnits.map((u) => u.value));

export const isValidCssValue = (cssValue) => {
  if (!cssValue || typeof cssValue !== "string") return false;
  const trimmed = cssValue.trim();
  const numberPart = parseFloat(trimmed);
  if (Number.isNaN(numberPart)) return false;
  const unitPart = trimmed.replace(numberPart.toString(), "");
  return ALLOWED_UNITS.has(unitPart);
};

export const parseCssValue = (cssValue, defaultUnit = "px") => {
  // console.log(cssValue)
  if (!cssValue || typeof cssValue !== "string") {
    return { value: 0, unit: defaultUnit };
  }
  const trimmed = cssValue.trim();
  const numberPart = parseFloat(trimmed);
  // If it's a valid number with a unit
  if (!Number.isNaN(numberPart)) {
    const unitPart = trimmed.replace(numberPart.toString(), "");
    if (ALLOWED_UNITS.has(unitPart)) {
      return { value: numberPart, unit: unitPart };
    }
  }
  // If no CSS unit found, return as is with null unit
  return { value: trimmed, unit: null };
};

// Convert number + unit into a valid CSS value
export const toCssValue = (value, unit) => {
  if (value === "" || value === null || value === undefined) {
    return "";
  }
  const cssValue = `${value}${unit}`;
  // console.log(cssValue)
  return cssValue;
};


