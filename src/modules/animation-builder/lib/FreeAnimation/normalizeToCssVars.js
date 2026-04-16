import { CSS_EASE_MAP } from "@/config/freeAnimProps";

// Normalize editor-shaped animation vars (raw seconds, {repeat,yoyo}, GSAP ease name) into CSS-ready values
export function normalizeToCssVars(vars = {}) {
  const out = {};
  if (vars.animationDelay != null) {
    out.animationDelay =
      typeof vars.animationDelay === "number"
        ? `${vars.animationDelay}s`
        : vars.animationDelay;
  }
  if (vars.animationDuration != null) {
    out.animationDuration =
      typeof vars.animationDuration === "number"
        ? `${vars.animationDuration}s`
        : vars.animationDuration;
  }
  if (vars.animationIterationCount != null) {
    // repeat-field emits { repeat, yoyo }; CSS needs a plain count (or "infinite").
    const raw = vars.animationIterationCount;
    if (typeof raw === "object") {
      out.animationIterationCount = raw.repeat === -1 ? "infinite" : raw.repeat;
      out.animationDirection = raw.yoyo ? "alternate" : "normal";
    } else {
      out.animationIterationCount = raw === -1 ? "infinite" : raw;
    }
  }
  if (vars.animationTimingFunction != null) {
    out.animationTimingFunction =
      CSS_EASE_MAP[vars.animationTimingFunction] ||
      vars.animationTimingFunction;
  }
  return out;
}
