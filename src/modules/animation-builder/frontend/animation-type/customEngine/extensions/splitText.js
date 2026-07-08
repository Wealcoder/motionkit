import { registerMethod } from "../registry.js";

// SplitText instances tracked per animation id, then deduped by selector +
// config signature within that animation — splitting the same DOM twice
// creates duplicate spans. Keying by animation id lets teardown(id) revert
// only that animation's splits, so a deleted animation restores its original
// text nodes instead of leaving the DOM stuck as split characters.
const splitsByAnim = new Map();

// Splits built before a timeline stamped its animation id (defensive) share
// one bucket so a global clear can still revert them.
const NO_ANIM = "__no_anim__";

function sigKey(selector, splitConfig) {
  return `${selector}::${JSON.stringify(splitConfig)}`;
}

function getSplit(animId, selector, splitConfig) {
  const key = animId || NO_ANIM;
  let bucket = splitsByAnim.get(key);
  if (!bucket) {
    bucket = new Map();
    splitsByAnim.set(key, bucket);
  }
  const sig = sigKey(selector, splitConfig);
  if (bucket.has(sig)) return bucket.get(sig);
  if (typeof SplitText === "undefined") return null;
  try {
    const s = SplitText.create(selector, splitConfig);
    bucket.set(sig, s);
    return s;
  } catch (e) {
    console.warn("[customEngine] SplitText failed for", selector, e);
    return null;
  }
}

function revertBucket(bucket) {
  bucket.forEach((s) => {
    try {
      s.revert();
    } catch (e) {
      /* noop */
    }
  });
  bucket.clear();
}

// Restore the original DOM for one animation — unwraps the char/word/line
// spans SplitText injected. Called by cleanup.teardown AFTER the gsap context
// revert, so the tween's inline styles are cleared before the spans are
// removed. Without this a deleted animation is left as split characters.
export function revertSplitsFor(animId) {
  const key = animId || NO_ANIM;
  const bucket = splitsByAnim.get(key);
  if (!bucket) return;
  revertBucket(bucket);
  splitsByAnim.delete(key);
}

export function clearSplitCache() {
  splitsByAnim.forEach(revertBucket);
  splitsByAnim.clear();
}

// Most granular wins: chars > words > lines.
function resolveTargetKey(type) {
  if (typeof type !== "string") return "chars";
  if (type.includes("chars")) return "chars";
  if (type.includes("words")) return "words";
  if (type.includes("lines")) return "lines";
  return "chars";
}

// SplitText runs as a PROPERTY now: it rides inside a from/to bucket as
//   { ...gsapVars, splitText: { type, mask, autoSplit, charsClass, ... } }
// inner `splitText` → SplitText.create config; everything else → tween vars.
// The bucket method (from/to) decides the tween direction on the split pieces.
// Legacy saved animations use `method: "splitText"` and route here as "from".
export function applySplitText(tl, step, vars, overlap, method = "from") {
  if (!step.itemClass || !vars) return;
  if (typeof SplitText === "undefined") return;

  const animId = tl?.vars?.data?.animationId || null;
  // `mask` is a UI placeholder select — "none" means no mask, but
  // SplitText.create only accepts "lines"/"words"/"chars"; strip it so masking
  // is truly disabled instead of passing an unrecognized value.
  const splitConfig = { ...(vars.splitText || {}) };
  if (splitConfig.mask === "none") delete splitConfig.mask;
  const split = getSplit(animId, step.itemClass, splitConfig);

  if (!split) return;

  const targets = split[resolveTargetKey(splitConfig.type)];
  if (!targets?.length) return;

  const tweenVars = { ...vars };
  delete tweenVars.splitText;

  const fn = method === "to" ? "to" : "from";
  tl[fn](targets, tweenVars, overlap);
}

export function registerSplitTextMethod() {
  if (typeof SplitText === "undefined") return false;
  try {
    gsap.registerPlugin(SplitText);
  } catch (e) {
    /* noop */
  }

  // Legacy: keep the standalone method for animations saved before splitText
  // became a property. New animations reach applySplitText via the standard
  // from/to handler.
  registerMethod("splitText", (tl, step, vars, overlap) =>
    applySplitText(tl, step, vars, overlap, "from"),
  );

  return true;
}
