import { registerMethod } from "../registry.js";

// One SplitText per unique selector + config signature — splitting the same
// DOM twice creates duplicate spans.
const splitCache = new Map();

function getSplit(selector, splitConfig) {
  const key = `${selector}::${JSON.stringify(splitConfig)}`;
  if (splitCache.has(key)) return splitCache.get(key);
  if (typeof SplitText === "undefined") return null;
  try {
    const s = SplitText.create(selector, splitConfig);
    splitCache.set(key, s);
    return s;
  } catch (e) {
    console.warn("[customEngine] SplitText failed for", selector, e);
    return null;
  }
}

export function clearSplitCache() {
  splitCache.forEach((s) => {
    try {
      s.revert();
    } catch (e) {
      /* noop */
    }
  });
  splitCache.clear();
}

// Most granular wins: chars > words > lines.
function resolveTargetKey(type) {
  if (typeof type !== "string") return "chars";
  if (type.includes("chars")) return "chars";
  if (type.includes("words")) return "words";
  if (type.includes("lines")) return "lines";
  return "chars";
}

// Editor emits vars as:
//   { ...gsapVars, splitText: { type, mask, autoSplit, charsClass, ... } }
// inner `splitText` → SplitText.create config; everything else → tl.from vars.
export function registerSplitTextMethod() {
  if (typeof SplitText === "undefined") return false;
  try {
    gsap.registerPlugin(SplitText);
  } catch (e) {
    /* noop */
  }

  registerMethod("splitText", (tl, step, vars) => {
    if (!step.itemClass || !vars) return;

    const splitConfig = vars.splitText || {};
    const split = getSplit(step.itemClass, splitConfig);

    if (!split) return;

    const targets = split[resolveTargetKey(splitConfig.type)];
    if (!targets?.length) return;

    const tweenVars = { ...vars };
    delete tweenVars.splitText;

    tl.from(targets, tweenVars);
  });

  return true;
}
