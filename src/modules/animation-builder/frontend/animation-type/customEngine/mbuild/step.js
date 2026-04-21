import { getMethod } from "../registry.js";
import { isStepActive } from "../select/filter.js";
import { normalizeStepVars } from "../select/merge.js";

export function applyStep(tl, step) {
  if (!isStepActive(step)) return;
  const handler = getMethod(step.method);
  if (!handler) {
    console.warn(`[customEngine] Unknown step method: "${step.method}"`);
    return;
  }
  const vars = normalizeStepVars(step);
  // call can have side-effectful semantics even with empty vars — let through.
  if (vars == null && step.method !== "call") return;
  handler(tl, step, vars);
}
