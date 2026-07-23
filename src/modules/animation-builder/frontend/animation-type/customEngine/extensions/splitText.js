import { registerMethod } from "../registry.js";

// SplitText instances deduped by selector + config signature ACROSS animations
// — two different animations targeting the same element with the same split
// config share one SplitText instance instead of each re-splitting the other's
// spans (SplitText.create on already-split markup corrupts the split). Each
// entry tracks which animation ids currently depend on it; the physical
// revert only happens once the last owner tears down, so tearing down one
// animation never yanks the shared spans out from under another that's still
// using them.
const splitsBySig = new Map(); // sig -> { split, owners: Set<animId> }

// Splits built before a timeline stamped its animation id (defensive) share
// one owner key so a global clear can still revert them.
const NO_ANIM = "__no_anim__";

function sigKey(selector, splitConfig) {
  return `${selector}::${JSON.stringify(splitConfig)}`;
}

// The editor saves duration/ease/stagger/delay on BOTH the from and to buckets
// of a fromTo step. Those control/timing keys belong on the `to` object only —
// leaving them on fromVars too confuses GSAP's per-target stagger distribution,
// collapsing the whole split into one synchronized tween instead of a cascade.
const FROMTO_CONTROL_KEYS = ["duration", "delay", "ease", "stagger", "repeat", "repeatDelay", "yoyo"];

function getSplit(animId, selector, splitConfig) {
  const owner = animId || NO_ANIM;
  const sig = sigKey(selector, splitConfig);
  const existing = splitsBySig.get(sig);
  if (existing) {
    existing.owners.add(owner);
    return existing.split;
  }
  // A DIFFERENT split config already active on this same selector must be
  // reverted first — SplitText.create() on already-split markup corrupts it,
  // leaving whichever animation runs next targeting stale/detached elements.
  splitsBySig.forEach((entry, otherSig) => {
    if (entry.selector === selector) {
      revertEntry(entry);
      splitsBySig.delete(otherSig);
    }
  });
  if (typeof SplitText === "undefined") return null;
  try {
    const split = SplitText.create(selector, splitConfig);
    splitsBySig.set(sig, { split, selector, owners: new Set([owner]) });
    return split;
  } catch (e) {
    console.warn("[customEngine] SplitText failed for", selector, e);
    return null;
  }
}

function revertEntry(entry) {
  try {
    entry.split.revert();
  } catch (e) {
    /* noop */
  }
}

// Restore the original DOM for one animation — unwraps the char/word/line
// spans SplitText injected, but only for splits no OTHER animation still
// depends on. Called by cleanup.teardown AFTER the gsap context revert, so
// the tween's inline styles are cleared before the spans are removed. Without
// this a deleted animation is left as split characters (or, for a shared
// split, an animation still using it loses its targets out from under it).
export function revertSplitsFor(animId) {
  const owner = animId || NO_ANIM;
  splitsBySig.forEach((entry, sig) => {
    if (!entry.owners.has(owner)) return;
    entry.owners.delete(owner);
    if (entry.owners.size === 0) {
      revertEntry(entry);
      splitsBySig.delete(sig);
    }
  });
}

export function clearSplitCache() {
  splitsBySig.forEach(revertEntry);
  splitsBySig.clear();
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
//
// For method "fromTo", `vars` is { from, to } (kept separate, NOT merged) so we
// can build a real two-endpoint tl.fromTo(). A tl.to()-only build's start value
// isn't captured until its first-ever render — if the element was already at
// its natural state by then (e.g. a scroll-triggered sibling tween revealed it
// first), that first render locks in a start === end no-op that replays as
// nothing on every subsequent restart.
export function applySplitText(tl, step, vars, overlap, method = "from") {
  if (!step.itemClass || !vars) return;
  if (typeof SplitText === "undefined") return;

  const animId = tl?.vars?.data?.animationId || null;
  const rawSplitCfg =
    method === "fromTo" ? vars.to?.splitText || vars.from?.splitText : vars.splitText;
  // `mask` is a UI placeholder select — "none" means no mask, but
  // SplitText.create only accepts "lines"/"words"/"chars"; strip it so masking
  // is truly disabled instead of passing an unrecognized value.
  const splitConfig = { ...(rawSplitCfg || {}) };
  if (splitConfig.mask === "none") delete splitConfig.mask;
  const split = getSplit(animId, step.itemClass, splitConfig);

  if (!split) return;

  const targets = split[resolveTargetKey(splitConfig.type)];
  if (!targets?.length) return;

  if (method === "fromTo") {
    const fromVars = { ...vars.from };
    delete fromVars.splitText;
    const toVars = { ...vars.to };
    delete toVars.splitText;
    // Control/timing keys belong on `to` for a two-object fromTo, but the
    // editor doesn't always save them on both buckets — fall back to
    // fromVars' value when `to` is missing one (e.g. stagger saved only on
    // `from`) before stripping it, so it doesn't just disappear.
    FROMTO_CONTROL_KEYS.forEach((key) => {
      if (toVars[key] === undefined && fromVars[key] !== undefined) {
        toVars[key] = fromVars[key];
      }
      delete fromVars[key];
    });
    tl.fromTo(targets, fromVars, toVars, overlap);
    return;
  }

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
