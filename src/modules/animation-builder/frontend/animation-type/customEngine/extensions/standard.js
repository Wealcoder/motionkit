import { registerMethod } from "../registry.js";

// ScrollToPlugin scrolls the tween's *target*. For window scrolling the tween
// must target `window`, not the click element — so when vars carry `scrollTo`
// we override step.itemClass.
const scrollToTarget = (vars) => (vars && vars.scrollTo ? window : null);

export function registerStandardMethods() {
  registerMethod("from", (tl, step, vars, overlap) => {
    const target = scrollToTarget(vars) || step.itemClass;
    if (target) tl.from(target, vars, overlap);
  });

  registerMethod("to", (tl, step, vars, overlap) => {
    const target = scrollToTarget(vars) || step.itemClass;
    if (target) tl.to(target, vars, overlap);
  });

  registerMethod("fromTo", (tl, step, vars, overlap) => {
    const hasScrollTo = vars?.to?.scrollTo || vars?.from?.scrollTo;
    const target = hasScrollTo ? window : step.itemClass;
    if (target) tl.fromTo(target, vars.from, vars.to, overlap);
  });

  registerMethod("set", (tl, step, vars, overlap) => {
    if (step.itemClass) tl.set(step.itemClass, vars, overlap);
  });

  registerMethod("call", (tl, step, vars, overlap) => {
    const raw = vars || {};
    const fn = typeof raw === "function" ? raw : raw.fn;
    const args = raw.args || [];
    if (typeof fn === "function") {
      tl.call(fn, args, overlap);
    } else if (typeof fn === "string") {
      tl.call(
        () => {
          try {
            new Function("args", fn)(args);
          } catch (e) {
            console.error("[customEngine] call error:", e);
          }
        },
        undefined,
        overlap,
      );
    }
  });
}
