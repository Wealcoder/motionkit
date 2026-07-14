import { getMethod } from "../registry.js";
import { isStepActive } from "../select/filter.js";
import { normalizeStepVars } from "../select/merge.js";
import { extractOverlap } from "../select/overlap.js";
import { withCompletion, debugLog } from "../helper/logger.js";

// Stamp identity + inspection metadata onto vars BEFORE the handler builds
// the tween. GSAP keeps vars.id and vars.data on the resulting tween object,
// so this metadata becomes addressable later via gsap.globalTimeline children
// — used by DevTools' snapshot reader, the property inspector, and any
// console-based debugging.
//
// Where the metadata lands depends on the method:
//   from/to/set/call  →  vars itself becomes tween.vars
//   fromTo            →  GSAP creates the tween from vars.to (not the wrapper),
//                        so we stamp on vars.to.
//
// We never mutate the original step object — always work on a fresh shallow
// copy of vars (and vars.to for fromTo).
function buildStampedVars(tl, step, vars) {
  const data = {
    ...(tl.vars?.data || {}), // inherits animationId, timelineId, etc.
    stepId: step?.id || null,
    stepTitle: step?.title || null,
    itemClass: step?.itemClass || null,
    method: step?.method || null,
    disabled: !!step?.disabled,
  };

  if (step?.method === "fromTo" && vars?.to && typeof vars.to === "object") {
    return {
      ...vars,
      to: withCompletion({ ...vars.to, id: step?.id, data }, data),
    };
  }

  return withCompletion({ ...vars, id: step?.id, data }, data);
}

export function applyStep(tl, step) {
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
  const stamped = buildStampedVars(tl, step, vars);
  handler(tl, step, stamped, overlap);
}
