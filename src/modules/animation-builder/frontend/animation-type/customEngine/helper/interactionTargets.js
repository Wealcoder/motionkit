import { querySelectorAllCached } from "../scheduler.js";

// trigger.selector is authoritative when set; otherwise the click/hover target
// falls back to the union of step itemClass selectors so a button driving its
// own scrollTo (no separate trigger element) just works.
export function collectInteractionTargets(anim) {
  const sel = anim.trigger?.selector;
  if (sel) return querySelectorAllCached(sel);
  const seen = new Set();
  const out = [];
  (anim.timeline?.animations || []).forEach((step) => {
    if (!step?.itemClass) return;
    querySelectorAllCached(step.itemClass).forEach((el) => {
      if (seen.has(el)) return;
      seen.add(el);
      out.push(el);
    });
  });
  return out;
}

export function timelineHasScrollTo(anim) {
  return (anim.timeline?.animations || []).some((step) => {
    if (step?.method === "scrollTo") return true;
    const v = step?.vars || {};
    return !!(v.to?.scrollTo || v.from?.scrollTo || v.set?.scrollTo);
  });
}
