import { registerMethod } from "../registry.js";
import { normalizeStepVars } from "../select/merge.js";

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

let elSeq = 0;
const elKeys = new WeakMap();

// scroll.js hands an ELEMENT as itemClass on the per-element path, and every element stringifies to the same "[object HTMLHeadingElement]" — so they need distinct keys.
function keyFor(selector) {
  if (typeof selector === "string") return selector;
  if (selector?.nodeType !== 1) return String(selector);
  let k = elKeys.get(selector);
  if (!k) elKeys.set(selector, (k = `__el${++elSeq}`));
  return k;
}

function sigKey(selector, splitConfig) {
  return `${keyFor(selector)}::${JSON.stringify(splitConfig)}`;
}

// The editor saves duration/ease/stagger/delay on BOTH the from and to buckets
// of a fromTo step. Those control/timing keys belong on the `to` object only —
// leaving them on fromVars too confuses GSAP's per-target stagger distribution,
// collapsing the whole split into one synchronized tween instead of a cascade.
const FROMTO_CONTROL_KEYS = ["duration", "delay", "ease", "stagger", "repeat", "repeatDelay", "yoyo"];

function getSplitEntry(animId, selector, splitConfig) {
  const owner = animId || NO_ANIM;
  const sig = sigKey(selector, splitConfig);
  const existing = splitsBySig.get(sig);
  if (existing) {
    existing.owners.add(owner);
    return existing;
  }
  // Share a live split with a different config rather than reverting it — re-splitting corrupts the markup, and reverting would yank the spans from every animation still using it. First config wins while it has owners.
  let conflict = null;
  splitsBySig.forEach((entry) => {
    if (!conflict && entry.selector === selector) conflict = entry;
  });
  if (conflict) {
    conflict.owners.add(owner);
    return conflict;
  }
  if (typeof SplitText === "undefined") return null;
  try {
    const split = SplitText.create(selector, splitConfig);
    const entry = { split, selector, sig, owners: new Set([owner]) };
    splitsBySig.set(sig, entry);
    return entry;
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

// "Revert Element" property: the tween's onComplete drops this animation's
// claim and unwraps the spans, but only once no OTHER animation depends on the
// split — same refcount rule teardown uses, so completing one animation never
// yanks the spans out from under another still tweening them.
function releaseSplit(entry, animId) {
  const owner = animId || NO_ANIM;
  if (!entry?.owners?.has(owner)) return;
  entry.owners.delete(owner);
  if (entry.owners.size === 0) {
    revertEntry(entry);
    splitsBySig.delete(entry.sig);
  }
}

// Chains onto whatever onComplete the step already carries instead of replacing it.
function withRevertOnComplete(tweenVars, entry, animId) {
  const prev = tweenVars.onComplete;
  return {
    ...tweenVars,
    onComplete(...args) {
      if (typeof prev === "function") prev.apply(this, args);
      releaseSplit(entry, animId);
    },
  };
}

export function clearSplitCache() {
  splitsBySig.forEach(revertEntry);
  splitsBySig.clear();
}

// UI-only keys ride inside the same splitText object as the real create options:
// `mask: "none"` is the select's placeholder for "no mask", and `revertElement`
// is the revert-on-complete flag. Neither is a SplitText.create option, and both
// have to be stripped identically here and in applySplitText — otherwise the
// pre-split and the tween build hash different sigs and split the element twice.
function normalizeSplitConfig(raw) {
  const cfg = { ...(raw || {}) };
  if (cfg.mask === "none") delete cfg.mask;
  delete cfg.revertElement;
  return cfg;
}

// Mirrors how applySplitText resolves its config, so a pre-split produces the same sig and the later call is a pure cache hit.
export function splitConfigForStep(step) {
  const vars = normalizeStepVars(step);
  if (!vars) return null;
  const raw =
    step.method === "fromTo"
      ? vars.to?.splitText || vars.from?.splitText
      : vars.splitText;
  if (!raw || typeof raw !== "object") return null;
  return normalizeSplitConfig(raw);
}

// gsap.context() reverts any SplitText created inside it, ignoring the owners refcount — so build splits out here and leave the context only the tweens.
export function presplitSteps(animId, steps) {
  if (typeof SplitText === "undefined") return;
  (steps || []).forEach((step) => {
    if (!step?.itemClass || step.disabled === true) return;
    const cfg = splitConfigForStep(step);
    if (cfg) getSplitEntry(animId, step.itemClass, cfg);
  });
}

// Most granular wins: chars > words > lines.
function resolveTargetKey(type) {
  if (typeof type !== "string") return "chars";
  if (type.includes("chars")) return "chars";
  if (type.includes("words")) return "words";
  if (type.includes("lines")) return "lines";
  return "chars";
}

// A shared split may not have the type this step asked for, so fall back to what it produced instead of animating nothing.
function pickTargets(split, type) {
  const requested = resolveTargetKey(type);
  if (split[requested]?.length) return split[requested];
  for (const key of ["chars", "words", "lines"]) {
    if (split[key]?.length) return split[key];
  }
  return null;
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
  const splitConfig = normalizeSplitConfig(rawSplitCfg);
  // Optional "Revert Element" property — restore the original markup once this
  // tween finishes instead of leaving the element as split spans.
  const revertOnComplete = rawSplitCfg?.revertElement === true;
  const entry = getSplitEntry(animId, step.itemClass, splitConfig);

  if (!entry) return;

  const targets = pickTargets(entry.split, splitConfig.type);
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
    tl.fromTo(
      targets,
      fromVars,
      revertOnComplete ? withRevertOnComplete(toVars, entry, animId) : toVars,
      overlap,
    );
    return;
  }

  const tweenVars = { ...vars };
  delete tweenVars.splitText;

  const fn = method === "to" ? "to" : "from";
  tl[fn](
    targets,
    revertOnComplete ? withRevertOnComplete(tweenVars, entry, animId) : tweenVars,
    overlap,
  );
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
