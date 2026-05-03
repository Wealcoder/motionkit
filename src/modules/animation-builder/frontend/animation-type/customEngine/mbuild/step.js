import { getMethod } from "../registry.js";
import { isStepActive } from "../select/filter.js";
import { normalizeStepVars } from "../select/merge.js";
import { extractOverlap } from "../select/overlap.js";

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
  handler(tl, step, vars, overlap);
}
