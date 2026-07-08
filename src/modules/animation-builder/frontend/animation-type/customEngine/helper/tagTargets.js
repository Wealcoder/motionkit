import { querySelectorAllCached } from "../scheduler.js";
import { tagElement } from "../cleanup.js";

// Append this step (animation effect) id to the element's comma-separated step-id list, deduped — one element can be targeted by several steps.
function tagStep(el, stepId) {
  if (!el || !el.setAttribute || !stepId) return;
  const existing = el.getAttribute("data-wcf-mk-step-id");
  const ids = existing ? existing.split(",") : [];
  if (ids.includes(stepId)) return;
  ids.push(stepId);
  el.setAttribute("data-wcf-mk-step-id", ids.join(","));
}

// Tag every animated element so the global reset sweep clears inline styles
// on device-switch without us tracking DOM refs individually.
export function tagAllTargets(anim) {
  (anim.timeline?.animations || []).forEach((step) => {
    if (!step?.itemClass) return;
    querySelectorAllCached(step.itemClass).forEach((el) => {
      tagElement(el, anim.id);
      tagStep(el, step.id);
    });
  });
}
