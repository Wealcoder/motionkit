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
  return cssValue;
};

// helper to parse padding,margin,border css value
export const parseBoxValues = (
  cssObject = {},
  prefix = "padding",
  defaultUnit = "px",
) => {
  const sides = ["Top", "Right", "Bottom", "Left"];
  const result = {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    unit: defaultUnit,
  };
  for (const side of sides) {
    const key = `${prefix}${side}`;
    const parsed = parseCssValue(cssObject[key], defaultUnit);

    result[side.toLowerCase()] = parsed.value;
  }
  return result;
};

// convert sides + value + unit to a valid css value
export const buildBoxValues = (values, prefix = "padding") => {
  const { top, right, bottom, left, unit } = values;
  const boxCssValue = {
    [`${prefix}Top`]: `${top}${unit}`,
    [`${prefix}Right`]: `${right}${unit}`,
    [`${prefix}Bottom`]: `${bottom}${unit}`,
    [`${prefix}Left`]: `${left}${unit}`,
  };

  return boxCssValue;
};

// Parse stroke CSS object → UI state
export const parseStrokeValues = (cssObject = {}, defaultUnit = "px") => {
  const widthParsed = parseCssValue(cssObject.strokeWidth, defaultUnit);
  return {
    size: widthParsed.value ?? 0,
    unit: widthParsed.unit ?? defaultUnit,
    color: cssObject.stroke ?? "#000000",
  };
};

// Build UI state → CSS object
export const buildStrokeValues = (values) => {
  const { size, unit, color } = values;
  const strokeCssValues = {
    strokeWidth: `${size}${unit}`,
    stroke: color,
  };
  return strokeCssValues;
};
