import { parseCssValue } from "@/utils/trnasformOriginHelper";

const DEFAULT_SHADOW = {
  offsetX: 0,
  offsetY: 0,
  blur: 0,
  spread: 0,
  color: "#000000",
};

export const parseDropShadow = (cssValue) => {
  if (!cssValue) return { ...DEFAULT_SHADOW };

  const match = cssValue.match(/drop-shadow\((.*)\)/);
  if (!match) return { ...DEFAULT_SHADOW };

  const parts = match[1].split(/\s+(?![^(]*\))/);

  return {
    offsetX: parseCssValue(parts[0]).value,
    offsetY: parseCssValue(parts[1]).value,
    blur: parseCssValue(parts[2]).value,
    spread: parseCssValue(parts[3]).value,
    color: parts.slice(4).join(" ") || DEFAULT_SHADOW.color,
  };
};
