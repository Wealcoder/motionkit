
// Accepts: "50% 50%", "10px 20px", "center top", "left bottom", "20 30" (fallback)
export const parseTransformOrigin = (input, fallbackUnit = "%") => {
  const raw = (input || "").trim();

  // default
  if (!raw) {
    return { x: `50${fallbackUnit}`, y: `50${fallbackUnit}` };
  }

  // normalize whitespace
  const parts = raw.split(/\s+/);

  const xRaw = parts[0] ?? "50%";
  const yRaw = parts[1] ?? "50%";

  return {
    x: normalizeOriginToken(xRaw, fallbackUnit, "x"),
    y: normalizeOriginToken(yRaw, fallbackUnit, "y"),
  };
};


// Builds CSS string back
export const buildTransformOrigin = ({ x, y }) => {
  const safeX = (x || "").trim();
  const safeY = (y || "").trim();
  const result=`${safeX} ${safeY}`.trim()
  return result;
};


// Converts keywords and bare numbers into valid CSS tokens
const normalizeOriginToken = (token, fallbackUnit, axis) => {
  const t = (token || "").toLowerCase().trim();

  // Keywords allowed by CSS
  const keywordsX = { left: "0%", center: "50%", right: "100%" };
  const keywordsY = { top: "0%", center: "50%", bottom: "100%" };

  if (axis === "x" && keywordsX[t]) return keywordsX[t];
  if (axis === "y" && keywordsY[t]) return keywordsY[t];

  // Numeric with unit: 10px, 50%, 1.2rem, 3em, 10vh, etc.
  if (/^-?\d*\.?\d+[a-z%]+$/i.test(t)) return t;

  // Bare number: "10" -> "10px" (fallback unit)
  if (/^-?\d*\.?\d+$/.test(t)) return `${t}${fallbackUnit}`;

  // Unknown token -> fallback to center
  return axis === "x" ? `50${fallbackUnit}` : `50${fallbackUnit}`;
};



// Parse a CSS value string into { value, unit }
export const parseCssValue = (cssValue, defaultUnit = "px") => {
    if (!cssValue || typeof cssValue !== "string") {
        return { value: 0, unit: defaultUnit };
    }

    const trimmed = cssValue.trim();

    const match = trimmed.match(/^(-?\d*\.?\d+)([a-z%]+)$/i);

    if (!match) {
        return { value: 0, unit: defaultUnit };
    }

    return {
        value: Number(match[1]),
        unit: match[2],
    };
};



// Convert number + unit into a valid CSS value
export const toCssValue = (value, unit) => {
    if (value === "" || value === null || value === undefined) {
        return "";
    }

    const cssValue = `${value}${unit}`;
    console.log(cssValue)
    return cssValue;
};
