import { registerMethod } from "../registry.js";

// ScrollToPlugin scrolls the tween's *target*. For window scrolling the tween
// must target `window`, not the click element — so when vars carry `scrollTo`
// we override step.itemClass.
const scrollToTarget = (vars) => (vars && vars.scrollTo ? window : null);

export function registerStandardMethods() {
  registerMethod("from", (tl, step, vars) => {
    const target = scrollToTarget(vars) || step.itemClass;
    if (target) tl.from(target, vars);
  });

  registerMethod("to", (tl, step, vars) => {
    const target = scrollToTarget(vars) || step.itemClass;
    if (target) tl.to(target, vars);
  });

  registerMethod("fromTo", (tl, step, vars) => {
    const hasScrollTo = vars?.to?.scrollTo || vars?.from?.scrollTo;
    const target = hasScrollTo ? window : step.itemClass;
    if (target) tl.fromTo(target, vars.from, vars.to);
  });

  registerMethod("set", (tl, step, vars) => {
    if (step.itemClass) tl.set(step.itemClass, vars);
  });

  registerMethod("call", (tl, step, vars) => {
    const raw = vars || {};
    const fn = typeof raw === "function" ? raw : raw.fn;
    const args = raw.args || [];
    if (typeof fn === "function") {
      tl.call(fn, args);
    } else if (typeof fn === "string") {
      tl.call(() => {
        try {
          new Function("args", fn)(args);
        } catch (e) {
          console.error("[customEngine] call error:", e);
        }
      });
    }
  });
}
