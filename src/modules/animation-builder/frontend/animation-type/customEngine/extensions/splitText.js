import { registerMethod } from "../registry.js";

// One SplitText per unique selector, shared across all animations that target
// it — splitting the same DOM twice creates duplicate spans.
const splitCache = new Map();

function getSplit(selector, type) {
  const key = `${selector}::${type}`;
  if (splitCache.has(key)) return splitCache.get(key);
  if (typeof SplitText === "undefined") return null;
  try {
    const s = new SplitText(selector, { type });
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

// Accepted step.vars shape:
//   { target: "chars"|"words"|"lines", splitType: "chars, words, lines",
//     method: "from"|"to"|"fromTo"|"set", from, to, ...gsapVars }
export function registerSplitTextMethod() {
  if (typeof SplitText === "undefined") return false;
  try {
    gsap.registerPlugin(SplitText);
  } catch (e) {
    /* noop */
  }

  registerMethod("splitText", (tl, step, vars) => {
    if (!step.itemClass || !vars) return;
    const splitType = vars.splitType || "chars, words, lines";
    const split = getSplit(step.itemClass, splitType);
    if (!split) return;
    const targetKey = vars.target || "chars";
    const targets = split[targetKey];
    if (!targets?.length) return;

    const method = vars.method || "from";
    if (method === "fromTo") {
      tl.fromTo(targets, vars.from || {}, vars.to || {});
      return;
    }
    const tweenVars = { ...vars };
    delete tweenVars.splitType;
    delete tweenVars.target;
    delete tweenVars.method;
    delete tweenVars.from;
    delete tweenVars.to;
    tl[method](targets, tweenVars);
  });

  return true;
}
