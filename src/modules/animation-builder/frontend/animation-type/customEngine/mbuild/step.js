import { getMethod } from "../registry.js";
import { isStepActive } from "../select/filter.js";
import { normalizeStepVars } from "../select/merge.js";
import { extractOverlap } from "../select/overlap.js";

// Stamp identity onto vars BEFORE the handler builds the tween. GSAP keeps
// vars.id and vars.data on the resulting tween object so DevTools' snapshot
// reader can find tweens via tween.vars.id (= step.id) and read editor-side
// IDs from tween.vars.data.
function stampMetadata(vars, tl, step, stepIndex) {
  if (!vars || typeof vars !== "object") return;
  if (step?.id) vars.id = step.id;
  vars.data = {
    ...(tl.vars?.data || {}),
    stepId: step?.id || null,
    stepIndex,
    stepTitle: step?.title || null,
    itemClass: step?.itemClass || null,
    method: step?.method || null,
  };
}

// fromTo carries from + to as separate sub-objects. We mirror metadata onto
// the wrapper object so it lands on the resulting tween's vars.
function stampFromToMetadata(vars, tl, step, stepIndex) {
  if (!vars || typeof vars !== "object") return;
  // The handler will pass vars.from + vars.to to gsap.fromTo; the resulting
  // tween's vars contains the merged set, so we put the metadata on `to`.
  if (vars.to && typeof vars.to === "object") {
    if (step?.id) vars.to.id = step.id;
    vars.to.data = {
      ...(tl.vars?.data || {}),
      stepId: step?.id || null,
      stepIndex,
      stepTitle: step?.title || null,
      itemClass: step?.itemClass || null,
      method: step?.method || null,
    };
  }
}

export function applyStep(tl, step, stepIndex) {
  if (!isStepActive(step)) return;
  const handler = getMethod(step.method);
  if (!handler) {
    console.warn(`[customEngine] Unknown step method: "${step.method}"`);
    return;
  }
  const rawVars = normalizeStepVars(step);
  // call can have side-effectful semantics even with empty vars — let through.
  if (rawVars == null && step.method !== "call") return;
  const { vars, overlap } = extractOverlap(step, rawVars);
  const newVars = { ...vars, id: step?.id };
  handler(tl, step, newVars, overlap);
}
