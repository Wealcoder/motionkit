import { applyStep } from "./step.js";

// Spread order: editor tlCfg.vars (repeat, paused, ...) first, then extra
// config from the caller (scrollTrigger, paused override for click/hover)
// so extras win.
export function buildTimeline(tlCfg, extraConfig) {
  const tlVars = {
    ...(tlCfg?.vars || {}),
    ...(extraConfig || {}),
    id: tlCfg?.id,
  };
  const tl = gsap.timeline(tlVars);
  for (const step of tlCfg?.animations || []) {
    applyStep(tl, step);
  }
  return tl;
}
